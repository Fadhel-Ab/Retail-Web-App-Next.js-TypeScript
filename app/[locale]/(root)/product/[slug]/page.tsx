import { getProductBySlug } from "@/lib/actions/products.actions";
import ProductPrice from "@/components/shared/products/product-price";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getPageContent } from "@/lib/custom-hooks/intlayer-hook";
import { Badge } from "@/components/ui/badge";
import ProductImages from "@/components/shared/products/product-images";
import AddToCart from "@/components/shared/products/add-to-cart";
import { getMyCart } from "@/lib/actions/cart.actions";


const ProductDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) => {
  const { slug, locale } = await params;
  const product = await getProductBySlug(slug);
  const cart=await getMyCart();

  if (!product) notFound();
  const { productPage } = await getPageContent("page", locale);
  const translatedName = locale === "en" ? product.name : product.nameAr;
  const translatedBrand = locale === "en" ? product.brand : product.brandAr;
  const translatedCategory =
    locale === "en" ? product.category : product.categoryAr;
  const translatedDescription =
    locale === "en" ? product.description : product.descriptionAr;

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-5">
        {/* images col */}
        <div className="col-span-2">
          <ProductImages images={product.images} />
        </div>
        {/* details col */}
        <div className="col-span-2 p-5">
          <div className="flex flex-col gap-6">
            <p>
              {translatedBrand} {translatedCategory}
            </p>
            <div className="h1 h3-bold">{translatedName}</div>
            <p>{product.rating}</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <ProductPrice
                value={Number(product.price)}
                className="w-24 rounded-full bg-green-100 text-green-700 px-5 py-2"
              />
            </div>
          </div>
          <div className="mt-10">
            <p className="font-semibold">{translatedDescription}</p>
          </div>
        </div>
        {/* Action col */}
        <div>
          <Card>
            <CardContent>
              <div className="mb-2 flex justify-between">
                <div>{productPage.price}</div>
                <div>
                  <ProductPrice value={Number(product.price)} />
                </div>
              </div>
              <div className="mb-2 flex justify-between">
                <div>{productPage.status}</div>
                {product.stock > 0 ? (
                  <Badge className="bg-gray-300" variant={"outline"}>
                    {productPage.inStock}
                  </Badge>
                ) : (
                  <Badge variant={"destructive"}>
                    {productPage.outOfStock}
                  </Badge>
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
                    }} locale={locale}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsPage;
