import { email, z } from "zod";
import { formatNumberWithDecimal } from "./utils";
import { Prisma } from "@prisma/client";
import { getPageContent } from "./custom-hooks/intlayer-hook";
import { PAYMENT_METHODS } from "./constants";

// zod schema for inserting product
// requires the text to include at least one Arabic character, rather than
// consist entirely of Arabic characters \u2014 real product data routinely mixes
// in digits, sizes, or Latin brand names (e.g. "\u0627\u064A\u0641\u0648\u0646 15 \u0628\u0631\u0648")
const arabicRegex = /[\u0600-\u06FF]/;
const priceRegex = /^\d+(.\d{2})?$/;
const currency = z
  .string()
  .refine((val) => priceRegex.test(formatNumberWithDecimal(val)), {
    message: "Price must have exactly 2 decimal places ",
  })
  .transform((val) => new Prisma.Decimal(val));
const currencyResponse = z.preprocess((val) => String(val), z.string());
const dataResponse = z
  .union([z.date(), z.string()])
  .transform((val) => (val instanceof Date ? val.toISOString() : val));

export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  nameAr: z
    .string()
    .regex(arabicRegex, {
      message: "Arabic Name must include Arabic characters",
    })
    .min(3, "Arabic Name Must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  category: z.string().min(3, "Category must be at least 3 characters"),
  categoryAr: z
    .string()
    .regex(arabicRegex, {
      message: "Arabic Category must include Arabic characters",
    })
    .min(3, "Arabic Category Must be at least 3 characters"),
  brand: z.string().min(3, "Brand must be at least 3 characters "),
  brandAr: z
    .string()
    .regex(arabicRegex, {
      message: "Arabic Brand must include Arabic characters",
    })
    .min(3, "Arabic Brand Must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  descriptionAr: z
    .string()
    .regex(arabicRegex, {
      message: "Arabic Description must include Arabic characters",
    })
    .min(3, "Arabic Description Must be at least 3 characters"),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "Product must have at least one image"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

export const ProductResponseSchema = z.object({
  id: z.string(),
  nameAr: z.string(),
  name: z.string(),
  slug: z.string(),
  category: z.string(),
  categoryAr: z.string(),
  brand: z.string(),
  brandAr: z.string(),
  description: z.string(),
  descriptionAr: z.string(),
  stock: z.number(),
  images: z.array(z.string()),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: z.preprocess((val) => String(val), z.string()),
  rating: z.preprocess((val) => String(val), z.string()),
  numReviews: z.number(),
  createdAt: dataResponse,
});
// zod schema for sign-in form
export const signInFormSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// zod schema for sign-up form in a function to get the translated error messages
export const createSignUpSchema = async (locale?: string) => {
  const { signUpValidation } = await getPageContent("page", locale ?? "en");
  return z
    .object({
      name: z.string().min(3, signUpValidation.name.value),
      email: z.email({ message: signUpValidation.email.value }),
      password: z.string().min(6, signUpValidation.password.value),
      confirmPassword: z
        .string()
        .min(6, signUpValidation.confirmPassword.value),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: signUpValidation.mismatch.value,
      path: ["confirmPassword"],
    });
};
// zod schema for sign-up form : regular version without translated error messages
/*export const signUpFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
}).refine((data)=> data.password=== data.confirmPassword, {
  message:"Passwords don't match",
  path:['confirmPassword']
});*/

export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  nameAr: z
    .string()
    .regex(arabicRegex, {
      message: "Arabic Name must include Arabic characters",
    })
    .min(3, "Arabic Name Must be at least 3 characters"),
  slug: z.string().min(1, "Product is required"),
  qty: z.number().int().nonnegative("Quantity must be positive number"),
  image: z.string().min(1, "Product is required"),
  price: z
    .union([z.instanceof(Prisma.Decimal), z.string(), z.number()])
    .refine((val) => priceRegex.test(formatNumberWithDecimal(val.toString())), {
      message: "Price must have exactly 2 decimal places ",
    })
    .transform((val) => val.toString()),
});
// zod schema for pushing cart to database
export const insertCartSchema = z.object({
  items: z
    .array(cartItemSchema)
    .transform((items) =>
      items.map((item) => ({ ...item, price: new Prisma.Decimal(item.price) })),
    ),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, "Session card id is required"),
  userId: z.string().optional().nullable(), // this will be null for guest users
});

export const CartResponseSchema = z.object({
  id: z.string(),
  items: z.array(cartItemSchema),
  itemsPrice: currencyResponse,
  totalPrice: currencyResponse,
  shippingPrice: currencyResponse,
  taxPrice: currencyResponse,
  sessionCartId: z.string().min(1, "Session card id is required"),
  userId: z.string().optional().nullable(), // this will be null for guest users
});

export const createShippingAddressSchema = (locale?: string) => {
  let translatedMessage = "must be at least 3 characters";
  if (locale) {
    translatedMessage =
      locale === "en"
        ? " must be at least 3 characters"
        : " يجب أن يتكون من 3 أحرف على الأقل";
  }

  return z.object({
    fullName: z.string().min(3, {
      message: translatedMessage,
    }),
    streetAddress: z.string().min(3, translatedMessage),
    city: z.string().min(3, translatedMessage),
    postalCode: z
      .union([z.string().min(3, translatedMessage), z.literal("")])
      .optional()
      .nullable(),
    country: z.string().min(3, translatedMessage),
    lat: z.number().optional(),
    lng: z.number().optional(),
  });
};

//schema for payment method
export const createPaymentMethodSchema = (locale: string) => {
  const translatedMessage =
    locale === "en" ? " Payment method is required " : "طريقة الدفع مطلوبة";

  return z
    .object({
      type: z.string().min(1, translatedMessage),
    })
    .refine((data) => PAYMENT_METHODS.includes(data.type), {
      path: ["type"],
      message: "invalid payment method",
    });
};

//schema for inserting order

export const createInsertOrderSchema = (locale?: string) => {
  let translatedMessage = "Payment method is required ";
  if (locale) {
    translatedMessage =
      locale === "en" ? " Payment method is required" : "طريقة الدفع مطلوبة";
  }

  return z.object({
    userId: z.string().min(1, ""),
    itemsPrice: currency,
    shippingPrice: currency,
    taxPrice: currency,
    totalPrice: currency,
    paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
      message: translatedMessage,
    }),
    shippingAddress: createShippingAddressSchema(locale),
  });
};
// schema for inserting an order item
export const createInsertOrderItemSchema = (locale?: string) => {
  let translatedMessage = "Payment method is required ";
  if (locale) {
    translatedMessage =
      locale === "en" ? " Payment method is required" : "طريقة الدفع مطلوبة";
  }

  return z.object({
    productId: z.string(),
    slug: z.string(),
    image: z.string(),
    name: z.string(),
    nameAr: z.string(),
    price: currency,
    qty: z.number(),
  });
};

export const orderResponseSchema = createInsertOrderSchema().extend({
  id: z.string(),
  itemsPrice: currencyResponse,
  shippingPrice: currencyResponse,
  taxPrice: currencyResponse,
  totalPrice: currencyResponse,
  paymentResult: z.unknown().nullable(),
  isPaid: z.boolean(),
  isDelivered: z.boolean(),
  paidAt: dataResponse.nullable(),
  deliveredAt: dataResponse.nullable(),
  createdAt: dataResponse,
  orderItems: z.array(
    createInsertOrderItemSchema().extend({ price: currencyResponse }),
  ),
  user: z.object({
    name: z.string(),
    email: z.string(),
  }),
});

export const ordersArraySchema = createInsertOrderSchema().extend({
  id: z.string(),
  itemsPrice: currencyResponse,
  shippingPrice: currencyResponse,
  taxPrice: currencyResponse,
  totalPrice: currencyResponse,
  paymentResult: z.unknown().nullable(),
  isPaid: z.boolean(),
  isDelivered: z.boolean(),
  paidAt: dataResponse.nullable(),
  deliveredAt: dataResponse.nullable(),
  createdAt: dataResponse,
});

export const createUpdateProfileSchema = (locale?: string) => {
   let translatedMessage = "must be at least 3 characters";
   if (locale) {
     translatedMessage =
       locale === "en"
         ? " must be at least 3 characters"
         : " يجب أن يتكون من 3 أحرف على الأقل";
   }


  return z.object({
    name:z.string().min(3,translatedMessage),
    email:z.email().min(3,translatedMessage),
  });
};