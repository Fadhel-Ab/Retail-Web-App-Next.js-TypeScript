"use server";
import prisma from "@/lib/prisma";
import { ProductResponseSchema, insertProductSchema } from "../validators";

import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { z } from "zod";
import { auth } from "@/auth";
import { formatError } from "@/lib/server-side-utils";
import { revalidatePath } from "next/cache";

export const getLatestProducts = async () => {
  const products = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
  });

  return z.array(ProductResponseSchema).parse(products);
};

export const getFeaturedProducts = async (limit = LATEST_PRODUCTS_LIMIT) => {
  const products = await prisma.product.findMany({
    where: { isFeatured: true },
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  return z.array(ProductResponseSchema).parse(products);
};

export const getProductBySlug = async (slug: string) => {
  const response = await prisma.product.findFirst({
    where: { slug: slug },
  });

  return ProductResponseSchema.parse(response);
};

async function requireAdmin() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    throw new Error("You are not authorized to manage products.");
  }
}

function revalidateProductAdminPaths(productId?: string) {
  revalidatePath("/en/admin/products");
  revalidatePath("/ar/admin/products");

  if (productId) {
    revalidatePath(`/en/admin/products/${productId}/edit`);
    revalidatePath(`/ar/admin/products/${productId}/edit`);
  }
}

export const getAllProducts = async ({
  limit = PAGE_SIZE,
  page = 1,
}: {
  limit?: number;
  page?: number;
}) => {
  await requireAdmin();

  const [products, dataCount] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.product.count(),
  ]);

  return {
    data: z.array(ProductResponseSchema).parse(products),
    totalPages: Math.ceil(dataCount / limit),
  };
};

export const getProductById = async (id: string) => {
  await requireAdmin();

  const product = await prisma.product.findFirst({
    where: { id },
  });

  return ProductResponseSchema.parse(product);
};

export async function createProduct(data: z.input<typeof insertProductSchema>) {
  try {
    await requireAdmin();
    const product = insertProductSchema.parse(data);

    await prisma.product.create({
      data: product,
    });

    revalidateProductAdminPaths();

    return {
      success: true,
      message: "Product created successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: await formatError(error),
    };
  }
}

export async function updateProduct(
  id: string,
  data: z.input<typeof insertProductSchema>,
) {
  try {
    await requireAdmin();
    const product = insertProductSchema.parse(data);

    await prisma.product.update({
      where: { id },
      data: product,
    });

    revalidateProductAdminPaths(id);

    return {
      success: true,
      message: "Product updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: await formatError(error),
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    await requireAdmin();

    await prisma.product.delete({
      where: { id },
    });

    revalidateProductAdminPaths();

    return {
      success: true,
      message: "Product deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: await formatError(error),
    };
  }
}
