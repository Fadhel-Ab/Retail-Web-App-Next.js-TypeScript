import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { OrderResponse } from "@/types";
import Link from "next/link";
import Image from "next/image";
import PlaceOrderForm from "../../place-order/place-order-form";
import BenefitPayButton from "./payment-benfit";

export default function OrderDetailsTable({
  order,
  locale,
}: {
  order: OrderResponse;
  locale: string;
}) {
  const {
    id,
    shippingAddress,
    orderItems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isDelivered,
    isPaid,
    paidAt,
    deliveredAt,
  } = order;

  return (
    <>
      <h1 className="py-4 text-2xl ">
        {locale === "en" ? "Order" : "الطلب"} {formatId(id)}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-4-y overflow-x auto">
          <Card>
            <CardContent className="py-2 px-5 gap-2">
              <h2 className="text-xl pb-4">
                {locale === "en" ? "Payment Method" : "طريقة الدفع"}
              </h2>
              <p className="mb-2">{paymentMethod}</p>
              {isPaid ? (
                <Badge
                  variant={"secondary"}
                  className="bg-green-100 text-green-700"
                >
                  {locale === "en" ? "Paid at" : "مدفوع في"}{" "}
                  {formatDateTime(new Date(paidAt!)).dateTime}
                </Badge>
              ) : (
                <Badge variant={"destructive"}>
                  {locale === "en" ? "Not paid" : "لم يتم الدفع"}
                </Badge>
              )}
            </CardContent>
          </Card>
          <Card className="my-3">
            <CardContent className="py-2 px-5 gap-2">
              <h2 className="text-xl pb-4">
                {locale === "en" ? "Shipping Address" : "عنوان الشحن"}
              </h2>
              <p>{shippingAddress.fullName}</p>
              <p className="mb-2">
                {shippingAddress.streetAddress}, {shippingAddress.city}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>

              {isDelivered ? (
                <Badge
                  variant={"secondary"}
                  className="bg-green-100 text-green-700"
                >
                  {locale === "en" ? "Delivered at" : "تم التسليم في"}{" "}
                  {formatDateTime(new Date(deliveredAt!)).dateTime}
                </Badge>
              ) : (
                <Badge variant={"destructive"}>
                  {locale === "en" ? "Not Delivered" : "لم يتم التسليم"}
                </Badge>
              )}
            </CardContent>
          </Card>
          <Card className="my-3 px-5">
            <h2 className="text xl pb-4">
              {locale === "en" ? "Order Items" : "عناصر الطلب"}
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">
                    {locale === "en" ? "Item" : "العنصر"}
                  </TableHead>
                  <TableHead className="text-center">
                    {locale === "en" ? "Quantity" : "الكمية"}
                  </TableHead>
                  <TableHead className="text-end">
                    {locale === "en" ? "Price" : "السعر"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/${locale}/product/${item.slug}`}
                        className="flex items-center"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                        ></Image>
                        <span>{locale === "en" ? item.name : item.nameAr}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">{item.qty}</TableCell>
                    <TableCell className="text-end">${item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="px-4 gap-4 space-y-4 text-lg mt-5">
              <div className="flex justify-between ">
                <div>{locale === "en" ? "Items" : "العنصر"}</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>{locale === "en" ? "Tax" : "الضريبة"}</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>{locale === "en" ? "Shipping" : "الشحن"}</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>{locale === "en" ? "Total Price" : "المبلغ الإجمالي"}</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              {!isPaid && <BenefitPayButton orderId={id} locale={locale} />}
            </CardContent>
          </Card>
          {!isPaid && (
            <Card>
              <CardContent className="px-4 gap-4 space-y-4 text-lg mt-5">
                <div className="">
                  <h2 className="text-destructive text-2xl">
                    {locale === "en" ? "Caution:" : "تحذير:"} <br />
                  </h2>
                  <p>
                    {locale === "en"
                      ? "Do not use real payment Card"
                      : "لا تستخدم بطاقة دفع حقيقية"}
                  </p>
                  <p>
                    {locale === "en"
                      ? "This is only for Testing Environment"
                      : "هذا فقط لبيئة الاختبار"}
                  </p>
                  <p>
                    {locale === "en"
                      ? "You can use test benefit cards from here"
                      : "يمكنك استخدام بطاقات بنفت الاختبارية من هنا"}
                  </p>
                  <Link
                    className="text-blue-400 courser-pointer bg-muted"
                    href={
                      "https://developers.tap.company/reference/testing-cards"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {locale === "en" ? "Click Here" : "اضغط هنا"}
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
