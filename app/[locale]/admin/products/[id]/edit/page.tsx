import { getProductById } from "@/lib/actions/products.actions";
import { Metadata } from "next";
import ProductForm from "../../product-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === "en" ? "Edit Product" : "تعديل المنتج",
  };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const product = await getProductById(id);

  return <ProductForm locale={locale} product={product} />;
}
