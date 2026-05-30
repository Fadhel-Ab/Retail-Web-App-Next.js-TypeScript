"use server";
import CategoriesGrid from "@/components/categories";
import ProductList from "@/components/shared/products/product-list";
import { Button } from "@/components/ui/button";
import { getLatestProducts } from "@/lib/actions/products.actions";
import { Metadata } from "next";
import Link from "next/link";
import BannerSlider from "./banners";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  // Fetch localized content for the sign-in page
  return {
    title: locale === "en" ? "Home" : "الرئيسية", // This will be plugged into your layout's %s template
  };
}

const Homepage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  //const { header } = await getPageContent("page", locale); if needed
  /*console.log(` language: ${locale}`);
  console.log(await getLatestProducts());*/ //testing
  const data = await getLatestProducts();
  const isAr = locale === "ar";

  return (
    <>
      <BannerSlider />
      <h2 className="h2-bold mb-4 ">
        {isAr ? "تسوق حسب الفئة" : "Shop by Category"}
      </h2>
      <CategoriesGrid locale={locale} />
      <div className=" mx-auto px-4">
        <ProductList
          data={data}
          title={isAr ? "المنتجات المميزة" : "Featured Products"}
          limit={5}
          locale={locale}
        />
      </div>
    </>
  );
};

export default Homepage;
