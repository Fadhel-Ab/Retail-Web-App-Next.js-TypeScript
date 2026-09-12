import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import ProductPrice from "./product-price";
import { getPageContent } from "@/lib/custom-hooks/intlayer-hook";
import { Product } from "@/types";
import { Star } from "lucide-react";
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
  const isAr = locale !== "en";
  const translatedName = locale === "en" ? product.name : product.nameAr;
  const translatedBrand = locale === "en" ? product.brand : product.brandAr;
  const roundedRating = Math.round(Number(product.rating));

  return (
    <Card className="w-full max-w-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="relative w-75 h-75 mx-auto p-0">
        {product.isFeatured && (
          <Badge className="absolute left-2 top-2 z-10 bg-brand text-brand-foreground hover:bg-brand">
            {isAr ? "مميز" : "Featured"}
          </Badge>
        )}
        <Link href={`/${locale}/product/${product.slug}`}>
          <Image
            className="aspect-square w-full object-cover"
            src={product.images[0]}
            alt={translatedName}
            height={300}
            width={300}
            priority={true}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 grid gap-2">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {translatedBrand}
        </div>
        <Link href={`/product/${product.slug}`}>
          <h2 className="text-sm font-medium">{translatedName}</h2>
        </Link>
        <div className="flex-start gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={
                index < roundedRating
                  ? "h-4 w-4 fill-brand text-brand"
                  : "h-4 w-4 text-muted-foreground/30"
              }
            />
          ))}
          <span className="ms-1 text-xs text-muted-foreground">
            ({product.numReviews})
          </span>
        </div>
        <div className="flex-between gap-4">
          {product.stock > 0 ? (
            <ProductPrice value={Number(product.price)} className="text-brand" />
          ) : (
            <div className="p text-destructive">{available.card}</div>
          )}
        </div>
        {product.stock > 0 && (
          <div className="">
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
