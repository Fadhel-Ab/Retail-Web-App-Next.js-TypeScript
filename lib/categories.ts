// lib/categories.ts

export const categories = [
  {
    id: "electronics",
    name: "Electronics",
    nameAr: "إلكترونيات",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661",
  },
  {
    id: "fashion",
    name: "Fashion",
    nameAr: "أزياء",
    slug: "fashion",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
  },
  {
    id: "home-kitchen",
    name: "Home & Kitchen",
    nameAr: "المنزل والمطبخ",
    slug: "home-kitchen",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
  },
  {
    id: "beauty",
    name: "Beauty",
    nameAr: "الجمال",
    slug: "beauty",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
  },
  {
    id: "sports",
    name: "Sports",
    nameAr: "رياضة",
    slug: "sports",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
  },
  {
    id: "gaming",
    name: "Gaming",
    nameAr: "ألعاب",
    slug: "gaming",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
  },
  {
    id: "books",
    name: "Books",
    nameAr: "كتب",
    slug: "books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794",
  },
  {
    id: "accessories",
    name: "Accessories",
    nameAr: "إكسسوارات",
    slug: "accessories",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}
