"use server";
import CategoriesGrid from "@/components/categories";
import ProductList from "@/components/shared/products/product-list";
import { Button } from "@/components/ui/button";
import { getLatestProducts } from "@/lib/actions/products.actions";
import { Metadata } from "next";
import Link from "next/link";

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
      <section className="bg-linear-to-r from-zinc-900 to-zinc-800 text-white py-16 px-6 text-center rounded-2xl my-6 shadow-lg max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          {isAr
            ? "اكتشف مجموعتنا الحصرية"
            : "Discover Our Exclusive Collection"}
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-8">
          {isAr
            ? "منتجات عالية الجودة منتقاة بعناية ومصممة خصيصًا لتلبية احتياجاتك اليومية."
            : "Handpicked premium products designed specifically to elevate your daily lifestyle."}
        </p>
        <Link href={`/${locale}/shop`}>
          <Button
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold px-8 py-6 text-lg rounded-xl transition-all shadow-md"
          >
            {isAr ? "ابدأ التسوق الآن ←" : "Start Shopping Now →"}
          </Button>
        </Link>
      </section>
      <h2 className="h2-bold mb-4 ">
        {isAr ? "تسوق حسب الفئة" : "Shop by Category"}
      </h2>
      <CategoriesGrid locale={locale} />
      <div className="max-w-7xl mx-auto px-4">
        <ProductList
          data={data}
          title={isAr ? "المنتجات المميزة" : "Featured Products"}
          limit={4}
          locale={locale}
        />
      </div>
    </>
  );
};

export default Homepage;
