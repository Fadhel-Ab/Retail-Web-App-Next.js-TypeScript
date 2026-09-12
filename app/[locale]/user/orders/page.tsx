import { Metadata } from "next";
import { getMyOrders } from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import Link from "next/link";
import { SearchParams } from "next/dist/server/request/search-params";
import Pagination from "@/components/shared/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { date } from "zod";
import { getHTMLTextDir } from "intlayer";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === "en" ? "My Orders" : "طلباتي",
  };
}

const OrdersPage = async ({
  searchParams,
  params,
}: {
  searchParams: Promise<{ page: string }>;
  params: Promise<{ locale: string }>;
}) => {
  const { page } = await searchParams;
  const { locale } = await params;
  const dir= getHTMLTextDir(locale);
  const orders = await getMyOrders({
    page: Number(page) || 1,
  });
  return (
    <div className="space-y-2">
      <h2 className="h2-bold">{locale === "en" ? "My Orders" : "طلباتي"}</h2>
      <div className="overflow-x-auto">
        <Table dir={dir} className="mb-4">
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">
                {" "}
                {locale === "en" ? "ID" : "رقم الطلب"}
              </TableHead>
              <TableHead className="text-start">
                {locale === "en" ? "Date" : "التاريخ"}
              </TableHead>
              <TableHead className="text-start">
                {locale === "en" ? "Total" : "المجموع"}
              </TableHead>
              <TableHead className="text-start">
                {locale === "en" ? "Paid" : "مدفوع"}
              </TableHead>
              <TableHead className="text-start">
                {locale === "en" ? "Delivered" : "تم التسليم"}
              </TableHead>
              <TableHead className="text-start">
                {locale === "en" ? "Action" : "الإجراء"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{formatId(order.id)}</TableCell>
                <TableCell>
                  {formatDateTime(new Date(order.createdAt)).dateTime}
                </TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  {order.isPaid && order.paidAt
                    ? formatDateTime(new Date(order.paidAt)).dateTime
                    : locale === "en"
                      ? "Not Paid"
                      : "لم يتم الدفع"}
                </TableCell>
                <TableCell>
                  {order.isDelivered && order.deliveredAt
                    ? formatDateTime(new Date(order.deliveredAt)).dateTime
                    : locale === "en"
                      ? "Not Delivered"
                      : "لم يتم التسليم"}
                </TableCell>

                <TableCell>
                  <Link href={`/${locale}/order/${order.id}`}>
                    <span className="px-2">
                      {locale === "en" ? "Details" : "تفاصيل الطلب"}
                    </span>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (<Pagination page={Number(page) || 1} totalPages={orders?.totalPages} locale={locale}></Pagination>)}
      </div>
    </div>
  );
};

export default OrdersPage;
