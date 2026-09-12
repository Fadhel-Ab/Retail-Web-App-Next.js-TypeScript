"use client";

import { Button } from "@/components/ui/button";
import { deleteUser, updateUserRole } from "@/lib/actions/users.actions";
import { Loader, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

type ActionResult = { success: boolean; message: string };

export default function UserActions({
  id,
  role,
  locale,
  isSelf,
}: {
  id: string;
  role: string;
  locale: string;
  isSelf: boolean;
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

  const onToggleRole = () => {
    const nextRole = role === "admin" ? "user" : "admin";
    runAction(() => updateUserRole(id, nextRole, locale));
  };

  const onDelete = () => {
    const message =
      locale === "en"
        ? "Are you sure you want to delete this user? Their orders will also be removed."
        : "هل أنت متأكد أنك تريد حذف هذا المستخدم؟ سيتم حذف طلباته أيضاً.";
    if (!window.confirm(message)) return;
    runAction(() => deleteUser(id, locale));
  };

  if (isSelf) {
    return (
      <span className="text-sm text-muted-foreground">
        {locale === "en" ? "This is you" : "هذا أنت"}
      </span>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={onToggleRole}
      >
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : role === "admin" ? (
          <ShieldOff className="h-4 w-4" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}
        {role === "admin"
          ? locale === "en"
            ? "Make User"
            : "تحويل لمستخدم"
          : locale === "en"
            ? "Make Admin"
            : "تحويل لمشرف"}
      </Button>
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
