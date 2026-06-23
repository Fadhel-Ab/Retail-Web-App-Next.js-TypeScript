import { Button } from "@/components/ui/button";
import ModeToggle from "./toggle-mode";
import { EllipsisVertical, ShoppingCart, UserIcon } from "lucide-react";
import Link from "next/link";
import SignInButton from "@/components/shared/header/sign-in-button";
import { LocaleSwitcher } from "./language-select";
import { getHTMLTextDir } from "intlayer";
import AdminDemo from "./admin-demo";
import { useIntlayer } from "next-intlayer/server";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import UserButton from "./user-button";

const Menu = ({ locale }: { locale: string }) => {
  const { header } = useIntlayer("page", locale);
  
  const dir = getHTMLTextDir(locale);
 
  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full max-w-xs gap-1 justify-end items-center">
        <LocaleSwitcher />
        <ModeToggle />
        <Button
          nativeButton={false}
          render={<Link href={`/${locale}/cart`} />}
          variant="ghost"
        >
          <ShoppingCart /> {header.cart}
        </Button>
        <AdminDemo locale={locale} />
        <UserButton locale={locale} />
      </nav>
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle">
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent side={dir === "rtl" ? "left" : "right"}>
            <SheetHeader>
              <SheetTitle>{header.menu}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 items-start ms-4">
              <ModeToggle />
              <LocaleSwitcher />
              <Button
                nativeButton={false}
                render={<Link href={`${locale}/cart`} />}
                variant="ghost"
              >
                <ShoppingCart /> {header.cart}
              </Button>
              <UserButton locale={locale} />
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
