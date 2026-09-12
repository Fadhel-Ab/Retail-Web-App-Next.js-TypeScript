import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { categories } from "@/lib/categories";

const Footer = ({ locale }: { locale: string }) => {
  const isAr = locale === "ar";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-brand bg-primary text-primary-foreground">
      <div className="wrapper grid gap-8 py-10 md:grid-cols-3">
        <div>
          <h3 className="text-xl font-bold">{APP_NAME}</h3>
          <p className="mt-2 max-w-xs text-sm text-primary-foreground/70">
            {isAr
              ? "وجهتك المميزة للتسوق الراقي، من الأزياء إلى التقنية والمنزل."
              : "Your destination for premium shopping — from fashion to tech to home."}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-brand">
            {isAr ? "تسوق" : "Shop"}
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/70">
            <li>
              <Link href={`/${locale}/shop`} className="hover:text-brand">
                {isAr ? "كل المنتجات" : "All Products"}
              </Link>
            </li>
            {categories.slice(0, 4).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/${locale}/shop?category=${category.slug}`}
                  className="hover:text-brand"
                >
                  {isAr ? category.nameAr : category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-brand">
            {isAr ? "الحساب" : "Account"}
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/70">
            <li>
              <Link href={`/${locale}/cart`} className="hover:text-brand">
                {isAr ? "العربة" : "Cart"}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/sign-in`} className="hover:text-brand">
                {isAr ? "تسجيل الدخول" : "Sign In"}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 py-5 text-center text-sm text-primary-foreground/60">
        {currentYear} {APP_NAME}.{" "}
        {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
      </div>
    </footer>
  );
};

export default Footer;
