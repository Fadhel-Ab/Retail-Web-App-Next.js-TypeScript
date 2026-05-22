// app/[locale]/shop/page.tsx

import prisma from "@/lib/prisma"; // Assuming this is your Prisma client export
import ProductList from "@/components/shared/products/product-list"; // Adjust the import path to match your folder structure
import { ProductResponseSchema } from "@/lib/validators";
import z from "zod";
 // Or your custom locale function

interface ShopPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";

  // Fetch all 6 products directly from the database vault
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc", // Show newest items first
    },
  });
  const data=z.array(ProductResponseSchema).parse(products);
  return (
    <main className="mx-auto px-4 py-12 min-h-screen">
      <header className="border-b border-zinc-200 pb-6 mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight  text-accent-foreground md:text-4xl">
          {isAr ? "متجرنا الكامل" : "Our Full Shop"}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 md:text-base">
          {isAr
            ? `تصفح مجموعتنا المختارة بعناية (${products.length} منتجات)`
            : `Browse our curated collection of premium essentials (${products.length} items)`}
        </p>
      </header>

      {products.length > 0 ? (
        <ProductList
          data={data}
          title={isAr ? "كل المنتجات" : "All Products"}
          locale={locale}
        />
      ) : (
        <div className="text-center py-24 border border-dashed border-zinc-300 rounded-2xl">
          <p className="text-zinc-500 text-lg">
            {isAr
              ? "لا توجد منتجات متوفرة حالياً."
              : "No products available at the moment."}
          </p>
        </div>
      )}
    </main>
  );
}
