import Footer from "@/components/footer";
import Header from "@/components/shared/header";
import { ReactNode } from "react";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import Menu from "@/components/shared/header/menu";
import MainNav from "./main-nav";
import { Input } from "@/components/ui/input";

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;
  //testing
  // console.log(`Root layout language: ${locale}`);
  return (
    <>
      <div className="flex flex-col">
        <div className="border-b container mx-auto">
          <div className="flex items-center h-16 px-4">
            <Link href={`/${locale}`} className="w-22">
              <Image
                src="/images/logo.svg"
                height={48}
                width={48}
                alt={APP_NAME}
              ></Image>
            </Link>
            <MainNav locale={locale} />
            <div className="ms-auto items-center flex space-x-4">
              <div>
                <Input
                  type="search"
                  placeholder="Search..."
                  className="md:w-25 lg:w-75"
                />
              </div>
              <Menu locale={locale} />
            </div>
          </div>
        </div>
        <div className=" container flex-1 space-y-4 p-8 pt-6 mx-auto">
          {children}
        </div>
      </div>
    </>
  );
}
