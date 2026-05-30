"use client";

import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/actions/products.actions";
import { Loader, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function DeleteProductButton({
  id,
  locale,
}: {
  id: string;
  locale: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onDelete = () => {
    const message =
      locale === "en"
        ? "Are you sure you want to delete this product?"
        : "هل أنت متأكد أنك تريد حذف هذا المنتج؟";

    if (!window.confirm(message)) return;

    startTransition(async () => {
      const res = await deleteProduct(id);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      router.refresh();
    });
  };

  return (
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
  );
}
