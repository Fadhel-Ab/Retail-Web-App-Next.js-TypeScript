
import Image from "next/image";
import Link from "next/link";


import Menu from "./menu";

import { getPageContent } from "@/lib/custom-hooks/intlayer-hook";

export default  function Header({locale}:{locale:string}) {
  const {header} = getPageContent("page",locale);
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between max-w-450 ">
        <div className="flex-start">
          <Link href={`/${locale}`} className="flex-start">
            <Image
              src="/images/logo.svg"
              alt={`${header.title} Logo`}
              width={48}
              height={48}
              priority={true}
            />

            <span className="hidden lg:block font-bold text-2xl ms-3">
              {header.title}
            </span>
          </Link>
          <Link
            href={`/${locale}/shop`}
            className=" font-medium text-gray-700 transition-colors hover:text-amber-600 ms-6"
          >
            Browse Products
          </Link>
        </div>
        <Menu locale={locale} />
      </div>
    </header>
  );
}
