
import { getOrderSummary } from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SalesChart from "@/app/[locale]/admin/overview/sales-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/auth";
import {
  BadgeDollarSign,
  CreditCard,
  PackageSearch,
  Users,
} from "lucide-react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  // Fetch localized content for the sign-in page
  return {
    title: locale === "en" ? "Admin Overview" : "نظرة عامة للمشرف", // This will be plugged into your layout's %s template
  };
}

const AdminOverviewPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return (
      <div className="p-4">
        <p className="text-lg font-medium">
          {locale === "en"
            ? "You are not authorized to view this page."
            : "غير مصرح لك بعرض هذه الصفحة."}
        </p>
      </div>
    );
  }

  const summary = await getOrderSummary();
  const totalSales = summary.salesData.reduce(
    (sum, item) => sum + item.totalSales,
    0,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {locale === "en" ? "Admin Dashboard" : "لوحة تحكم المشرف"}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>
              {locale === "en" ? "Total Sales" : "إجمالي المبيعات"}
            </CardTitle>
            <BadgeDollarSign />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatCurrency(Number(summary.totalSales))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{locale === "en" ? "Orders" : "الطلبات"}</CardTitle>
            <CreditCard />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {summary.ordersCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{locale === "en" ? "Users" : "المستخدمون"}</CardTitle>
            <Users />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {summary.usersCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{locale === "en" ? "Products" : "المنتجات"}</CardTitle>
            <PackageSearch />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {summary.productsCount}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>
              {locale === "en" ? "Monthly Sales" : "المبيعات الشهرية"}
            </CardTitle>
          </CardHeader>
          <CardContent>
<SalesChart data={summary.salesData} locale={locale}/>
            {/* <div className="space-y-4"> simple chart 
              {summary.salesData.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {locale === "en"
                    ? "No sales data available."
                    : "لا توجد بيانات مبيعات."}
                </p>
              ) : (
                summary.salesData.map((item) => (
                  <div key={item.month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.month}</span>
                      <span>{formatCurrency(item.totalSales)}</span>
                    </div>
                    <div className="h-2 w-full rounded bg-muted">
                      <div
                        className="h-2 rounded bg-primary"
                        style={{
                          width: `${(item.totalSales / totalSales) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div> */}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>
              {locale === "en" ? "Latest Sales" : "أحدث المبيعات"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">
                    {locale === "en" ? "Customer" : "العميل"}
                  </TableHead>
                  <TableHead className="text-start">
                    {locale === "en" ? "Date" : "التاريخ"}
                  </TableHead>
                  <TableHead className="text-start">
                    {locale === "en" ? "Total" : "المجموع"}
                  </TableHead>
                  <TableHead className="text-start">
                    {locale === "en" ? "Details" : "التفاصيل"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody >
                {summary.latestSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.user?.name ?? "N/A"}</TableCell>

                    <TableCell>
                      {formatDateTime(new Date(sale.createdAt)).dateTime}
                    </TableCell>
                    <TableCell>{formatCurrency(sale.totalPrice)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/${locale}/order/${sale.id}`}
                        className="text-primary hover:underline"
                      >
                        {locale === "en" ? "View Details" : "عرض"}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
