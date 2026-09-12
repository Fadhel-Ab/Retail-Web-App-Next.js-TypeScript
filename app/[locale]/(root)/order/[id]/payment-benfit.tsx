
"use client";
import { useTransition } from "react";
import { createPaymentCharge } from "@/lib/actions/payment.action";
import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order.actions";

export default function BenefitPayButton({
  orderId,
  locale = "en",
}: {
  orderId: string;
  locale?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const isAr = locale !== "en";

 
  const handlePayment = () => {
    startTransition(async () => {
      const res = await createPaymentCharge(orderId);
      if (res.success) {
        window.location.href = res.paymentUrl; // Redirect to Tap Sandbox
      }
    });
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isPending}
      className="bg-[#e90030] hover:bg-[#c70029] text-white w-full"
    >
      {isPending
        ? isAr
          ? "جاري الاتصال..."
          : "Connecting..."
        : isAr
          ? "الدفع عبر بينفت باي"
          : "Pay with BenefitPay"}
    </Button>
  );
}
