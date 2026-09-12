import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPageContent } from "@/lib/custom-hooks/intlayer-hook";
import type { Metadata } from "next";
import Link from "next/link";
import { locale } from "react-intlayer/server";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import CredentialSignInForm from "./credentials-signing-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { localizedRedirect } from "@/lib/redirect";
type Props = {
  params: Promise<{ locale: string }>;
};
// can be done with getLocale in the layout and passing it down as a prop to avoid multiple calls, but this is just for demonstration also this is better
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  // Fetch localized content for the sign-in page
  return {
    title: locale === "en" ? "Sign In" : "تسجيل الدخول", // This will be plugged into your layout's %s template
  };
}

const SignInPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl: string }>;
}) => {
  const { locale } = await params;
  const { callbackUrl } = await searchParams;
    const session = await auth();
    if (session) {
     return localizedRedirect(callbackUrl || "/", locale);
    }
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Recruiter Demo Credentials */}
      <div className="rounded-lg border border-brand/30 bg-brand/10 p-4 text-sm mb-4">
        <p className="font-semibold text-brand mb-2">
          🔑 {locale === "en" ? "Demo Credentials" : "بيانات دخول تجريبية"}
        </p>
        <div className="space-y-1 text-foreground/80">
          <p>
            <span className="font-medium">
              {locale === "en" ? "Admin:" : "المشرف:"}
            </span>{" "}
            admin@example.com / 123456
          </p>
          <p>
            <span className="font-medium">
              {locale === "en" ? "User:" : "المستخدم:"}
            </span>{" "}
            user@example.com / 123456
          </p>
        </div>
      </div>
      <Card>
        <CardHeader className="space-y-4">
          <Link href={`/${locale}`} className="flex-center">
            <Image
              src={"/images/logo.svg"}
              width={100}
              height={100}
              alt={`${APP_NAME} logo`}
              priority={true}
            ></Image>
          </Link>
          <CardTitle className="text-center">
            {locale === "en" ? "Sign In" : "تسجيل الدخول"}
          </CardTitle>
          <CardDescription className="text-center">
            {locale === "en"
              ? "Sign in to your account"
              : "قم بتسجيل الدخول إلى حسابك"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CredentialSignInForm locale={locale}></CredentialSignInForm>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
