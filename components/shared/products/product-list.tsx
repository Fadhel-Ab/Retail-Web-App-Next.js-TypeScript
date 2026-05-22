// eslint-disable-next-line @typescript-eslint/no-explicit-any
import ProductCard from "./product-card";
import { Product } from "@/types";

const ProductList = ({
  data,
  title,
  limit,
  locale,
}: {
  data: Product[];
  title: string;
  limit?: number;
  locale:string;
}) => {
  const limitedData = limit ? data.slice(0, limit) : data;
  return (
    <div className="my-10">
      <h2 className="h2-bold mb-4">{title}</h2>
      {data.length > 0 ? (
        <div className="grid justify-items-center px-1 grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
          {limitedData.map((product: Product) => (
            <ProductCard key={product.slug} product={product} locale={locale} />
          ))}
        </div>
      ) : (
        <div>
          <p>No Products Found</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
