import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import { getAllOrders } from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Eye } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import OrderActions from "./order-actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === "en" ? "Admin Orders" : "طلبات المشرف",
  };
}

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const { data: orders, totalPages } = await getAllOrders({
    limit: 10,
    page: currentPage,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {locale === "en" ? "Orders" : "الطلبات"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === "en"
            ? "Manage every order placed in your store."
            : "إدارة جميع الطلبات في متجرك."}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">
                {locale === "en" ? "Order" : "الطلب"}
              </TableHead>
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
                {locale === "en" ? "Payment" : "الدفع"}
              </TableHead>
              <TableHead className="text-start">
                {locale === "en" ? "Delivery" : "التسليم"}
              </TableHead>
              <TableHead className="text-end pe-14">
                {locale === "en" ? "Actions" : "الإجراءات"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {locale === "en" ? "No orders found." : "لا توجد طلبات."}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {formatId(order.id)}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {order.user?.name ?? "N/A"}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {order.user?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDateTime(new Date(order.createdAt)).dateOnly}
                  </TableCell>
                  <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                  <TableCell>
                    {order.isPaid ? (
                      <Badge className="bg-brand text-brand-foreground hover:bg-brand">
                        {locale === "en" ? "Paid" : "مدفوع"}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        {locale === "en" ? "Not Paid" : "غير مدفوع"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.isDelivered ? (
                      <Badge className="bg-brand text-brand-foreground hover:bg-brand">
                        {locale === "en" ? "Delivered" : "تم التسليم"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {locale === "en" ? "Pending" : "قيد الانتظار"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Link
                          href={`/${locale}/order/${order.id}`}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          {locale === "en" ? "View" : "عرض"}
                        </Link>
                      </Button>
                      <OrderActions
                        id={order.id}
                        isPaid={order.isPaid}
                        isDelivered={order.isDelivered}
                        locale={locale}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination page={currentPage} totalPages={totalPages} locale={locale} />
      )}
    </div>
  );
}
