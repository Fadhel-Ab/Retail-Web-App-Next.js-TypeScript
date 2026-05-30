import { Metadata } from "next";
import ProductForm from "../product-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === "en" ? "Add Product" : "إضافة منتج",
  };
}

export default async function AddProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <ProductForm locale={locale} />;
}
