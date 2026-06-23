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
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-800 dark:bg-blue-950">
        <p className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
          🔑 Demo Credentials
        </p>
        <div className="space-y-1 text-blue-600 dark:text-blue-400">
          <p>
            <span className="font-medium">Admin:</span> admin@example.com /
            123456
          </p>
          <p>
            <span className="font-medium">User:</span> user@example.com / 123456
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
