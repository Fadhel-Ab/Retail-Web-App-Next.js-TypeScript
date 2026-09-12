"use server";
import prisma from "@/lib/prisma";
import { getLocale } from "next-intlayer/server";
import { auth } from "@/auth";
import { createHmac } from "node:crypto";

export async function createPaymentCharge(orderId: string) {
  const locale = await getLocale();
  const postUrl = `${process.env.TAP_WEBHOOK_URL}api/paymentResponse`;
  console.log("Webhook URL:", postUrl);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  const session = await auth();
  const userName = session?.user?.name;
  const userEmail = session?.user?.email;

  const response = await fetch("https://api.tap.company/v2/charges", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TAP_SECRET_KEY}`, // remove NEXT_PUBLIC_
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      amount: Number(Number(order.totalPrice).toFixed(3)),
      currency: "BHD",
      reference: {
        order: orderId,
        transaction: orderId,
      },
      customer_initiated: true,
      threeDSecure: true,
      save_card: false,
      description: `Order Payment for #${orderId}`,
      metadata: { orderId },
      customer: {
        first_name: userName,
        last_name: "User",
        email: userEmail,
        phone: {
          country_code: "973",
          number: "33000000",
        },
      },

      source: { id: "src_bh.benefit" },

      redirect: {
        url: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}${locale}/order/${orderId}`,
      },
      post: {
        url: `${process.env.TAP_WEBHOOK_URL}`,
      },
    }),
  });

  const data = await response.json();

  console.log("STATUS:", response.status);
  console.log("FULL RESPONSE:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(data?.message || "Tap API request failed");
  }

  const url = data.transaction?.url;
  if (url) {
    return { success: true, paymentUrl: url };
  }

  throw new Error("Payment created but no redirect URL returned");
}

export async function verifyPayment(orderId: string, tapId: string) {
  try {
    const response = await fetch(
      `https://api.tap.company/v2/charges/${tapId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.TAP_SECRET_KEY}`,
          accept: "application/json",
        },
      },
    );

    const data = await response.json();

    if (data.status === "CAPTURED") {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          paidAt: new Date(Number(data.transaction.created)),
          paymentResult: {
            id: data.id,
            status: data.status,
            email_address: data.customer.email,
            phone: data.customer.phone.number,
          },
        },
      });
      return { success: true };
    }

    return { success: false, message: "Payment not captured" };
  } catch (error) {
    return { success: false, message: "Verification failed" };
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function validateWebhookHash(body: any, receivedHash: string) {
  const secretKey = process.env.TAP_SECRET_KEY || "";

  const id = body.id;
  const amount = body.amount?.toFixed(3);
  const currency = body.currency;
  const gateway_reference = body.reference?.gateway ?? "";
  const payment_reference = body.reference?.payment ?? "";
  const status = body.status;
  const created = body.transaction?.created;

  const toBeHashed =
    `x_id${id}` +
    `x_amount${amount}` +
    `x_currency${currency}` +
    `x_gateway_reference${gateway_reference}` +
    `x_payment_reference${payment_reference}` +
    `x_status${status}` +
    `x_created${created}`;

  console.log("String to hash:", toBeHashed);

  const calculatedHash = createHmac("sha256", secretKey)
    .update(toBeHashed)
    .digest("hex");

  console.log("Calculated hash:", calculatedHash);
  console.log("Received hash:", receivedHash);
  console.log("Match:", calculatedHash === receivedHash);

  return calculatedHash === receivedHash;
}
