import Link from "next/link";
import { categories } from "@/lib/categories";
import Image from "next/image";

export default function CategoriesGrid({locale}:{locale:string}) {
  return (
    <div className="grid grid-cols-4 lg:flex justify-between gap-4 my-10  mx-auto">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/${locale}/shop`}//{`/categories/${category.slug}`}
          className="hover:scale-105 transition-transform duration-300 rounded-xl "
        >
          <Image
            src={category.image}
            alt={category.name}
            width={400}
            height={300}
            className="w-full h-38 aspect-video shrink-0 object-cover rounded-xl  "
          />
          <h2 className="font-semibold p-2 text-center">{category.name}</h2>
        </Link>
      ))}
    </div>
  );
}
