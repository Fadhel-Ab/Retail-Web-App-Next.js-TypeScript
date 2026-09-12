"use server";
import CategoriesGrid from "@/components/categories";
import ProductList from "@/components/shared/products/product-list";
import { getFeaturedProducts } from "@/lib/actions/products.actions";
import { Metadata } from "next";
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
  const data = await getFeaturedProducts(8);
  const isAr = locale === "ar";

  return (
    <>
      <BannerSlider />
      <div className="wrapper">
        <div className="mb-4 text-center">
          <h2 className="h2-bold">
            {isAr ? "تسوق حسب الفئة" : "Shop by Category"}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {isAr
              ? "اكتشف مجموعتنا عبر الفئات المختارة بعناية"
              : "Discover our curated range across every category"}
          </p>
        </div>
        <CategoriesGrid locale={locale} />
        <ProductList
          data={data}
          title={isAr ? "المنتجات المميزة" : "Featured Products"}
          limit={8}
          locale={locale}
        />
      </div>
    </>
  );
};

export default Homepage;
