"use server";

import z from "zod";
import { formatError } from "../server-side-utils";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import prisma from "../prisma";
import { getUserById } from "./users.actions";
import { getLocale } from "next-intlayer/server";
import {
  createInsertOrderSchema,
  orderResponseSchema,
  ordersArraySchema,
} from "../validators";
import { CartItem } from "@/types";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("You are not authorized to manage orders.");
  }
}

function revalidateAdminOrdersPaths() {
  revalidatePath("/en/admin/orders");
  revalidatePath("/ar/admin/orders");
}

//create order and create the order item
export async function createOrder() {
  const locale = await getLocale();
  try {
    const session = await auth();
    if (!session) throw new Error("User is not Authenticated");
    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) throw new Error("User no found");
    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "your cart is empty",
        redirectTo: ".cart",
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: "No shipping address",
        redirectTo: "/shipping-address",
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: "No payment method",
        redirectTo: "/payment-method",
      };
    }

    // create the z validation schema and pass the locale
    const insertOrderSchema = createInsertOrderSchema(locale);
    // create the order object
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // create the transaction to create order and the order item in database
    // tweaks needed: move the $transaction to the api/webhook later
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // create order
      const insertedOrder = await tx.order.create({ data: order });
      // create order items from the car items
      for (const item of cart.items as CartItem[]) {
        // find product and check stock
        const product = await tx.product.findFirst({
          where: { id: item.productId },
        });
        if (!product) throw new Error(`item not found ${item.name}`);
        if (product.stock < item.qty) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        // decrement the stock for the item
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.qty },
          },
        });

        await tx.orderItem.create({
          data: {
            ...item,
            orderId: insertedOrder.id,
          },
        });
      }
      // clear the cart after successful order creation
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });
      return insertedOrder.id;
    });
    if (!insertedOrderId) throw new Error("Order not created");

    return {
      success: true,
      message: "Order created",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// get order by id
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  return orderResponseSchema.parse(data);
}

export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();
  if (!session) throw new Error("User is not Authorized ");
  const userId = session?.user?.id;
  if (!userId) throw new Error("User is not found ");
  const rawData = await prisma.order.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const data = z.array(ordersArraySchema).parse(rawData);

  const dataCount = await prisma.order.count({
    where: { userId: userId },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit), // total number of orders divided by the number of orders i want to display on each page
  };
}

// get the sales data and order summary
export async function getOrderSummary() {
  // get counts for each resource
  const [ordersCount, productsCount, usersCount] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count(),
  ]);

  // calculate the total sales
  const totalSales = await prisma.order.aggregate({
    _sum: {
      totalPrice: true,
    },
  });

  // get monthly sales
  const rawSalesData = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY') ORDER BY min("createdAt")`;

  // get latest sales
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      createdAt: true,
      totalPrice: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales: totalSales._sum.totalPrice ?? 0,
    salesData: rawSalesData.map((entry) => ({
      month: entry.month,
      totalSales: Number(entry.totalSales),
    })),
    latestSales: latestSales.map((sale) => ({
      ...sale,
      totalPrice: Number(sale.totalPrice),
    })),
  };
}

// get all orders (admin only, paginated)
export const getAllOrders = async ({
  limit = PAGE_SIZE,
  page = 1,
}: {
  limit?: number;
  page?: number;
}) => {
  await requireAdmin();

  const [orders, dataCount] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        orderItems: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.order.count(),
  ]);

  return {
    data: z.array(orderResponseSchema).parse(orders),
    totalPages: Math.ceil(dataCount / limit),
  };
};

// delete an order (admin only)
export async function deleteOrder(id: string, locale?: string) {
  try {
    await requireAdmin();
    await prisma.order.delete({ where: { id } });
    revalidateAdminOrdersPaths();

    return {
      success: true,
      message:
        locale === "ar" ? "تم حذف الطلب بنجاح." : "Order deleted successfully.",
    };
  } catch (error) {
    return { success: false, message: await formatError(error) };
  }
}

// mark an order as paid (admin only)
export async function markOrderAsPaid(id: string, locale?: string) {
  try {
    await requireAdmin();
    const order = await prisma.order.findFirst({ where: { id } });
    if (!order) throw new Error("Order not found");
    if (order.isPaid) {
      return {
        success: false,
        message: locale === "ar" ? "الطلب مدفوع بالفعل." : "Order is already paid.",
      };
    }

    await prisma.order.update({
      where: { id },
      data: { isPaid: true, paidAt: new Date() },
    });
    revalidateAdminOrdersPaths();

    return {
      success: true,
      message:
        locale === "ar" ? "تم تعليم الطلب كمدفوع." : "Order marked as paid.",
    };
  } catch (error) {
    return { success: false, message: await formatError(error) };
  }
}

// mark an order as delivered (admin only)
export async function markOrderAsDelivered(id: string, locale?: string) {
  try {
    await requireAdmin();
    const order = await prisma.order.findFirst({ where: { id } });
    if (!order) throw new Error("Order not found");
    if (!order.isPaid) {
      return {
        success: false,
        message:
          locale === "ar"
            ? "يجب دفع الطلب أولاً قبل تسليمه."
            : "Order must be paid before it can be delivered.",
      };
    }
    if (order.isDelivered) {
      return {
        success: false,
        message: locale === "ar" ? "تم تسليم الطلب بالفعل." : "Order is already delivered.",
      };
    }

    await prisma.order.update({
      where: { id },
      data: { isDelivered: true, deliveredAt: new Date() },
    });
    revalidateAdminOrdersPaths();

    return {
      success: true,
      message:
        locale === "ar" ? "تم تعليم الطلب كمسلَّم." : "Order marked as delivered.",
    };
  } catch (error) {
    return { success: false, message: await formatError(error) };
  }
}
