// app/[locale]/shop/page.tsx

import prisma from "@/lib/prisma"; // Assuming this is your Prisma client export
import ProductList from "@/components/shared/products/product-list"; // Adjust the import path to match your folder structure
import { ProductResponseSchema } from "@/lib/validators";
import { getCategoryBySlug } from "@/lib/categories";
import Link from "next/link";
import z from "zod";
 // Or your custom locale function

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { locale } = await params;
  const { category: categorySlug } = await searchParams;
  const isAr = locale === "ar";

  const activeCategory = categorySlug ? getCategoryBySlug(categorySlug) : undefined;

  // Fetch products, optionally scoped to the active category
  const products = await prisma.product.findMany({
    where: activeCategory ? { category: activeCategory.name } : undefined,
    orderBy: {
      createdAt: "desc", // Show newest items first
    },
  });
  const data=z.array(ProductResponseSchema).parse(products);

  const heading = activeCategory
    ? isAr
      ? activeCategory.nameAr
      : activeCategory.name
    : isAr
      ? "متجرنا الكامل"
      : "Our Full Shop";

  return (
    <main className="mx-auto px-4 py-12 min-h-screen">
      <header className="border-b border-border pb-6 mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          {heading}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          {isAr
            ? `تصفح مجموعتنا المختارة بعناية (${products.length} منتجات)`
            : `Browse our curated collection of premium essentials (${products.length} items)`}
        </p>
        {activeCategory && (
          <Link
            href={`/${locale}/shop`}
            className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
          >
            {isAr ? "مسح الفلتر ×" : "Clear filter ×"}
          </Link>
        )}
      </header>

      {products.length > 0 ? (
        <ProductList
          data={data}
          title={isAr ? "كل المنتجات" : "All Products"}
          locale={locale}
        />
      ) : (
        <div className="text-center py-24 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground text-lg">
            {isAr
              ? "لا توجد منتجات متوفرة حالياً."
              : "No products available at the moment."}
          </p>
        </div>
      )}
    </main>
  );
}
