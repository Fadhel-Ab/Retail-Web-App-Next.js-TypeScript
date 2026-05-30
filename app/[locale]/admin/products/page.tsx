import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import { getAllProducts } from "@/lib/actions/products.actions";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Edit, Plus } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import DeleteProductButton from "./delete-product-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === "en" ? "Admin Products" : "منتجات المشرف",
  };
}

export default async function AdminProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const { data: products, totalPages } = await getAllProducts({limit: 10, page: currentPage});

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {locale === "en" ? "Products" : "المنتجات"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {locale === "en"
              ? "Manage every product in your database."
              : "إدارة جميع المنتجات في قاعدة البيانات."}
          </p>
        </div>
        <Button >
          <Link href={`/${locale}/admin/products/new`} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            {locale === "en" ? "Add Product" : "إضافة منتج"}
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-start'>{locale === "en" ? "Product" : "المنتج"}</TableHead>
              <TableHead className='text-start'>{locale === "en" ? "Category" : "الفئة"}</TableHead>
              <TableHead className='text-start'>{locale === "en" ? "Price" : "السعر"}</TableHead>
              <TableHead className='text-start'>{locale === "en" ? "Stock" : "المخزون"}</TableHead>
              <TableHead className='text-start'>{locale === "en" ? "Created" : "تاريخ الإنشاء"}</TableHead>
              <TableHead className="text-end pe-14">
                {locale === "en" ? "Actions" : "الإجراءات"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {locale === "en"
                    ? "No products found."
                    : "لا توجد منتجات."}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={product.images[0]}
                        alt={locale === "en" ? product.name : product.nameAr}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {locale === "en" ? product.name : product.nameAr}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {locale === "en" ? product.category : product.categoryAr}
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    {formatDateTime(new Date(product.createdAt)).dateOnly}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button  variant="outline" size="sm">
                        <Link href={`/${locale}/admin/products/${product.id}/edit`} className="flex items-center gap-1">
                          <Edit className="h-4 w-4" />
                          {locale === "en" ? "Edit" : "تعديل"}
                        </Link>
                      </Button>
                      <DeleteProductButton id={product.id} locale={locale} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination page={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}
