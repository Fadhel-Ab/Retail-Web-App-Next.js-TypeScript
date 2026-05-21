"use client";
import { Cart, CartItem, CartResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PlusIcon, Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";

const AddToCart = ({
  item,
  locale,
  cart,
}: {
  item: CartItem;
  locale: string;
  cart?: CartResponse;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);
      //handle failure adding to cart
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      //handle success add to cart
      toast.success(res.message, {
        action: (
          <Button
            className={
              "bg-primary text-primary-foreground hover:bg-muted-foreground cursor-pointer"
            }
            onClick={() => router.push(`/${locale}/cart`)}
          >
            {locale === "en" ? "Go to Cart" : "الذهاب إلى السلة"}
          </Button>
        ),
      });
      return;
    });
  };
  // check if item is in the cart
  const existItem =
    cart && cart.items.find((i) => i.productId === item.productId);

  //handle removal
  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      return;
    });
  };

  return existItem ? (
    <div className="flex items-center justify-center">
      <Button
        type="button"
        variant={"outline"}
        onClick={handleRemoveFromCart}
        className={"grow"}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Minus className="h-4 w-5" />
        )}
      </Button>
      <span className="px-3 text-2xl">{existItem.qty}</span>
      <Button
        type="button"
        variant={"outline"}
        onClick={handleAddToCart}
        className={"grow"}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <PlusIcon className="h-4 w-5" />
        )}
      </Button>
    </div>
  ) : (
    <Button
      className={"w-full cursor-pointer"}
      type="button"
      onClick={handleAddToCart}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <PlusIcon className="h-4 w-5" />
      )}
      {locale === "en" ? "Add to Cart" : "أضف إلى السلة"}
    </Button>
  );
};

export default AddToCart;
