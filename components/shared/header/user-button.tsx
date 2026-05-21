import { LogOut, UserIcon } from "lucide-react";
import SignInButton from "./sign-in-button";
import { signOutUser } from "@/lib/actions/users.actions";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const UserButton = async ({ locale }: { locale: string }) => {
  const session = await auth();
  if (!session) {
    return (
      <SignInButton locale={locale}>
        <UserIcon /> {locale === "en" ? "Sign In" : "تسجيل الدخول"}
      </SignInButton>
    );
  }

  const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? "U";
  return (
    <div className="flex gap-2 items-center font-medium">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              className={
                "relative w-8 h-8 rounded-full ms-2 flex items-center justify-center bg-gray-200"
              }
              variant={"ghost"}
            >
              {firstInitial}
            </Button>
          }
        ></DropdownMenuTrigger>

        <DropdownMenuContent className={"w-56"} align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel className={"font-normal"}>
              <div className="flex flex-col">
                <div className="text-sm font-medium leading-none">
                  {session.user?.name}
                </div>
                <div className="text-sm text-muted-foreground leading-none">
                  {session.user?.email}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem className={"mt-1"}>
              <Link href={`/${locale}/user/profile`} className="w-full">
                {locale === "en" ? "Profile" : "الملف الشخصي"}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/${locale}/user/orders`} className="w-full">
                {locale === "en" ? "Order History" : "سجل الطلبات"}
              </Link>
            </DropdownMenuItem>
            {session?.user?.role === "admin" && (
              <DropdownMenuItem>
                <Link href={`/${locale}/admin/overview`} className="w-full">
                  {locale === "en" ? "Admin" : "الإدارة"}
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className={"p-0 mb-1 "}>
              <form action={signOutUser} className="flex my-2 w-full">
                <Button
                  className={
                    "w-full py-2 px-2 h-4 justify-start cursor-pointer"
                  }
                  variant={"ghost"}
                  type="submit"
                >
                  {" "}
                  {locale === "en" ? "Sign Out" : "تسجيل الخروج"}
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserButton;
