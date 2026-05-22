import Footer from "@/components/footer";
import Header from "@/components/shared/header";
import { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;
  //testing
  // console.log(`Root layout language: ${locale}`);
  return (
    <div className="flex h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1 wrapper max-w-450">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
