
import Image from "next/image";
import Link from "next/link";


import Menu from "./menu";

import { getPageContent } from "@/lib/custom-hooks/intlayer-hook";

export default  function Header({locale}:{locale:string}) {
  const {header} = getPageContent("page",locale);
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="wrapper flex-between max-w-450 py-1">
        <div className="flex-start">
          <Link href={`/${locale}`} className="flex-start">
            <Image
              src="/images/logo.svg"
              alt={`${header.title} Logo`}
              width={48}
              height={48}
              priority={true}
            />

            <span className="hidden lg:block font-bold text-2xl tracking-tight ms-3">
              {header.title}
            </span>
          </Link>
          <Link
            href={`/${locale}/shop`}
            className="font-medium uppercase text-sm tracking-wide text-muted-foreground transition-colors hover:text-brand ms-6"
          >
            {locale === "en" ? "Browse Products" : "تصفح المنتجات"}
          </Link>
        </div>
        <Menu locale={locale} />
      </div>
    </header>
  );
}
