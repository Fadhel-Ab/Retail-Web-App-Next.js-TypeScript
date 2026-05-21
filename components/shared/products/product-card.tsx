import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import ProductPrice from "./product-price";
import { getPageContent } from "@/lib/custom-hooks/intlayer-hook";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import AddToCart from "./add-to-cart";
import { getMyCart } from "@/lib/actions/cart.actions";

const ProductCard = async ({
  product,
  locale,
}: {
  product: Product;
  locale: string;
}) => {
  const available = await getPageContent("page", locale);
  const cart=await getMyCart();
  const translatedName = locale === "en" ? product.name : product.nameAr;
  const translatedBrand = locale === "en" ? product.brand : product.brandAr;
  return (
    <Card className="w-full max-w-sm hover:scale-105 transition-transform duration-300">
      <CardHeader className="w-75 h-75 ">
        <Link href={`/${locale}/product/${product.slug}`}>
          <Image
            className="object-cover"
            src={product.images[0]}
            alt={translatedName}
            height={300}
            width={300}
            priority={true}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 grid gap-4">
        <div className="text-xs">{translatedBrand}</div>
        <Link href={`/product/${product.slug}`}>
          <h2 className="text-sm font-medium">{translatedName}</h2>
        </Link>
        <div className="flex-between gap-4">
          <p>{product.rating} stars</p>
          {product.stock > 0 ? (
            <ProductPrice value={Number(product.price)} />
          ) : (
            <div className="p text-destructive">{available.card}</div>
          )}
        </div>
        {product.stock > 0 && (
          <div className="">
            {/* <Button className={"w-full"}>{productPage.addToCart}</Button> */}
            <AddToCart
              cart={cart}
              item={{
                productId: product.id,
                name: product.name,
                nameAr: product.nameAr,
                slug: product.slug,
                price: product.price,
                qty: 1,
                image: product.images![0],
              }}
              locale={locale}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
