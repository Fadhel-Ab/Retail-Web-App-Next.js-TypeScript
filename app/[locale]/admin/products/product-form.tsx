/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { CldUploadButton } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/products.actions";
import { insertProductSchema } from "@/lib/validators";
import { Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader, Plus, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  Control,
  Controller,
  Resolver,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import Image from "next/image";
import { toast } from "sonner";
import { Prisma } from "@prisma/client";
import { z } from "zod";

type ProductFormValues = z.input<typeof insertProductSchema>;

type ProductFormProps = {
  locale: string;
  product?: Product;
};

const emptyValues: ProductFormValues = {
  name: "",
  nameAr: "",
  slug: "",
  category: "",
  categoryAr: "",
  brand: "",
  brandAr: "",
  description: "",
  descriptionAr: "",
  stock: 0,
  images: [],
  isFeatured: false,
  banner: "",
  price: "0.00",
};

function productToFormValues(product?: Product): ProductFormValues {
  if (!product) return emptyValues;

  return {
    name: product.name,
    nameAr: product.nameAr,
    slug: product.slug,
    category: product.category,
    categoryAr: product.categoryAr,
    brand: product.brand,
    brandAr: product.brandAr,
    description: product.description,
    descriptionAr: product.descriptionAr,
    stock: product.stock,
    images: product.images,
    isFeatured: product.isFeatured,
    banner: product.banner ?? "",
    price: product.price,
  };
}

export default function ProductForm({ locale, product }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const isEditing = Boolean(product);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(
      insertProductSchema,
    ) as unknown as Resolver<ProductFormValues>,
    defaultValues: productToFormValues(product),
  });

  const images = form.watch("images") ?? [];
  // const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  // const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  //const canUploadToCloudinary = Boolean(cloudName && uploadPreset);

  const text = {
    title: isEditing
      ? locale === "en"
        ? "Edit Product"
        : "تعديل المنتج"
      : locale === "en"
        ? "Add Product"
        : "إضافة منتج",
    submit: isEditing
      ? locale === "en"
        ? "Save Product"
        : "حفظ المنتج"
      : locale === "en"
        ? "Create Product"
        : "إنشاء المنتج",
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
    startTransition(async () => {
       console.log("price type:", typeof values.price);
       console.log("price value:", values.price);
      const payload = {
        ...values,
        price:
          (values.price as any) instanceof Prisma.Decimal
            ? (values.price as any).toFixed(2) // Decimal → "10.00" string
            : values.price.toString(), // already string
        banner: values.banner || null,
      };
      const res = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);

         console.log("payload price type:", typeof payload.price);
         console.log("payload price:", payload.price);
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      router.push(`/${locale}/admin/products`);
      router.refresh();
    });
  };


  const removeImageUrl = (indexToRemove: number) => {
    form.setValue(
      "images",
      images.filter((_, index) => index !== indexToRemove),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  /* const uploadToCloudinary = async (file: File) => {
    if (!cloudName || !uploadPreset) {
      toast.error(
        locale === "en"
          ? "Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to enable uploads."
          : "أضف إعدادات Cloudinary لتفعيل رفع الصور.",
      );
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", uploadPreset);

    setIsUploading(true);
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        },
      );
      const data = await response.json();

      if (!response.ok || !data.secure_url) {
        throw new Error(data.error?.message || "Cloudinary upload failed.");
      }

      form.setValue("images", [...images, data.secure_url], {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success(locale === "en" ? "Image uploaded." : "تم رفع الصورة.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }; */

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{text.title}</h1>
          <p className="text-sm text-muted-foreground">
            {locale === "en"
              ? "Fill in the product details and upload at least one image."
              : "أدخل تفاصيل المنتج وارفع صورة واحدة على الأقل."}
          </p>
        </div>
        <Button type="submit" disabled={isPending || isUploading}>
          {isPending ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {text.submit}
        </Button>
      </div>

      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <ProductInput control={form.control} name="name" label="Name" />
        <ProductInput
          control={form.control}
          name="nameAr"
          label="Arabic Name"
        />
        <ProductInput control={form.control} name="slug" label="Slug" />
        <ProductInput control={form.control} name="category" label="Category" />
        <ProductInput
          control={form.control}
          name="categoryAr"
          label="Arabic Category"
        />
        <ProductInput control={form.control} name="brand" label="Brand" />
        <ProductInput
          control={form.control}
          name="brandAr"
          label="Arabic Brand"
        />
        <ProductInput control={form.control} name="price" label="Price" />
        <ProductInput
          control={form.control}
          name="stock"
          label="Stock"
          inputType="number"
        />
        <ProductInput control={form.control} name="banner" label="Banner URL" />
      </FieldGroup>

      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <ProductTextarea
          control={form.control}
          name="description"
          label="Description"
        />
        <ProductTextarea
          control={form.control}
          name="descriptionAr"
          label="Arabic Description"
        />
      </FieldGroup>

      <Controller
        name="isFeatured"
        control={form.control}
        render={({ field }) => (
          <FieldGroup className="flex-row items-center">
            <Input
              type="checkbox"
              className="h-5 w-5"
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
            />
            <FieldLabel className="text-lg" htmlFor="isFeatured">
              {locale === "en" ? "Featured Product ?" : " منتج مميز ؟"}
            </FieldLabel>
          </FieldGroup>
        )}
      />

      <Field data-invalid={Boolean(form.formState.errors.images)}>
        <FieldLabel>{locale === "en" ? "Images" : "الصور"}</FieldLabel>
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex flex-col items-center gap-2 md:flex-row">
            <Button
              className="w-full"
              variant="outline"
              disabled={isUploading}
              render={
                <CldUploadButton
                  uploadPreset="retail-web-app"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onSuccess={(result: any) => {
                    form.setValue(
                      "images",
                      [...images, result.info.secure_url],
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    );

                    console.log("the" + result.info.secure_url);
                  }}
                />
              }
            >
              {isUploading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {locale === "en" ? "Browse Files" : "تصفح الملفات"}
            </Button>
          </div>
          <span className="text-sm font-medium text-center">
            {locale === "en" ? "OR" : " أو"}
          </span>
          <div className="flex flex-col gap-2 md:flex-row">
            <Input
              name="images"
              value={manualUrl}
              placeholder="https://example.com/product.jpg"
              onChange={(e) => setManualUrl(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!manualUrl || manualUrl.trim() === "") return;
                form.setValue("images", [...images, manualUrl], {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setManualUrl(""); // clear input after adding
              }}
            >
              <Plus className="h-4 w-4" />
              {locale === "en" ? "Add URL" : "إضافة الرابط"}
            </Button>
          </div>

          {/*  Real-time Image Preview Grid */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="relative h-40 w-40 overflow-hidden rounded group "
                >
                  {/* The Image Element */}
                  <Image
                    width={500}
                    height={500}
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className=" object-cover object-center"
                    onError={(e) => {
                      // Fallback if the admin inputs a broken URL string
                      e.currentTarget.src = "https://placehold.co";
                    }}
                  />

                  {/*  Action: Delete button overlay */}
                  <Button
                    variant="default"
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    className="absolute right-2 top-2 rounded-full shadow-sm bg-destructive text-destructive-foreground hover:bg-destructive/80  transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        {form.formState.errors.images && (
          <FieldError errors={[form.formState.errors.images]} />
        )}
      </Field>
    </form>
  );
}

type ProductFieldName = keyof ProductFormValues;

function ProductInput({
  control,
  name,
  label,
  inputType = "text",
}: {
  control: Control<ProductFormValues>;
  name: ProductFieldName;
  label: string;
  inputType?: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>{label}</FieldLabel>
          <Input
            {...field}
            value={(field.value as string | number | undefined) ?? ""}
            type={inputType}
            aria-invalid={fieldState.invalid}
            autoComplete="off"
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

function ProductTextarea({
  control,
  name,
  label,
}: {
  control: Control<ProductFormValues>;
  name: ProductFieldName;
  label: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>{label}</FieldLabel>
          <Textarea
            {...field}
            value={(field.value as string | undefined) ?? ""}
            aria-invalid={fieldState.invalid}
            rows={5}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
