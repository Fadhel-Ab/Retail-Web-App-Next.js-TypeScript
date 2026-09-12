import Link from "next/link";
import { categories } from "@/lib/categories";
import Image from "next/image";

export default function CategoriesGrid({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 my-10">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/${locale}/shop?category=${category.slug}`}
          className="group relative overflow-hidden rounded-xl border border-border shadow-sm transition-shadow duration-300 hover:shadow-lg"
        >
          <Image
            src={category.image}
            alt={isAr ? category.nameAr : category.name}
            width={400}
            height={300}
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <h2 className="absolute inset-x-0 bottom-0 p-3 text-center font-semibold text-white transition-colors group-hover:text-brand">
            {isAr ? category.nameAr : category.name}
          </h2>
        </Link>
      ))}
    </div>
  );
}
