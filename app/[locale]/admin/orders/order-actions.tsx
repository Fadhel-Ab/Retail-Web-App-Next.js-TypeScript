"use client";

import { Button } from "@/components/ui/button";
import {
  deleteOrder,
  markOrderAsDelivered,
  markOrderAsPaid,
} from "@/lib/actions/order.actions";
import { CheckCircle2, Loader, PackageCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

type ActionResult = { success: boolean; message: string };

export default function OrderActions({
  id,
  isPaid,
  isDelivered,
  locale,
}: {
  id: string;
  isPaid: boolean;
  isDelivered: boolean;
  locale: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const runAction = (action: () => Promise<ActionResult>) => {
    startTransition(async () => {
      const res = await action();
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.refresh();
    });
  };

  const onDelete = () => {
    const message =
      locale === "en"
        ? "Are you sure you want to delete this order?"
        : "هل أنت متأكد أنك تريد حذف هذا الطلب؟";
    if (!window.confirm(message)) return;
    runAction(() => deleteOrder(id, locale));
  };

  return (
    <div className="flex justify-end gap-2">
      {!isPaid && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => runAction(() => markOrderAsPaid(id, locale))}
        >
          {isPending ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {locale === "en" ? "Mark Paid" : "تعليم كمدفوع"}
        </Button>
      )}
      {isPaid && !isDelivered && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => runAction(() => markOrderAsDelivered(id, locale))}
        >
          {isPending ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <PackageCheck className="h-4 w-4" />
          )}
          {locale === "en" ? "Mark Delivered" : "تعليم كمسلَّم"}
        </Button>
      )}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={onDelete}
      >
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        {locale === "en" ? "Delete" : "حذف"}
      </Button>
    </div>
  );
}
