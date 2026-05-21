"use server";

import z, { date, success } from "zod";
import { formatError } from "../server-side-utils";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import prisma from "../prisma";
import { getUserById } from "./users.actions";
import { get } from "http";
import { getLocale } from "next-intlayer/server";
import {
  createInsertOrderSchema,
  orderResponseSchema,
  ordersArraySchema,
} from "../validators";
import { CartItem } from "@/types";
import { toPlainObject } from "../utils";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";

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
  const ordersCounts = await prisma.order.count();
  const productsCounts = await prisma.product.count();
  const usersCounts = await prisma.user.count();

  // calculate the total sales
  const totalSales = await prisma.order.aggregate({
    _sum: {
      totalPrice: true,
    },
  });
  //get monthly sales
  const rawSalesData = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP By to_char("createdAt", 'MM/YY')`;
  // get latest sales
 
}
