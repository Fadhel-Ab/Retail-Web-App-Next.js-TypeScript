import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import { ShippingAddress } from "@/types";
import OrderDetailsTable from "./order-details-table";

type Props = {
  params: Promise<{ locale: string }>;
};
// can be done with getLocale in the layout and passing it down as a prop to avoid multiple calls, but this is just for demonstration also this is better
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  // Fetch localized content for the sign-in page
  return {
    title: locale === "en" ? "Order Details" : "تفاصيل الطلب", // This will be plugged into your layout's %s template
  };
}

const OrderDetailsPage = async ({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) => {
  const { locale, id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  return (<><OrderDetailsTable order={order} locale={locale}/></>);
};

export default OrderDetailsPage;
