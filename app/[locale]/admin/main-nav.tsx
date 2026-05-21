"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React from "react";

type MyComponentProp = {
  locale: string;
} & React.HTMLAttributes<HTMLElement>;

const MainNav = ({ className, locale, ...props }: MyComponentProp) => {
  const links = [
    {
      title: locale === "en" ? "Overview" : "نظرة عامة",
      href: `/${locale}/admin/overview`,
    },
    {
      title: locale === "en" ? "Products" : "المنتجات",
      href: `/${locale}/admin/products`,
    },
    {
      title: locale === "en" ? "Orders" : "الطلبات",
      href: `/${locale}/admin/orders`,
    },
    {
      title: locale === "en" ? "Users" : "المستخدمون",
      href: `/${locale}/admin/users`,
    },
  ];
  const pathName = usePathname();
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathName.includes(item.href) ? "" : "text-muted-foreground",
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
};

export default MainNav;
