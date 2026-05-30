export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Fadhel Store";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "A modern E-commerce store built with next.js ";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "https://retail-web-app-swart.vercel.app/";
export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.NEXT_PUBLIC_LATEST_PRODUCTS_LIMIT) || 5;
export const defaultSignInValues = {
  email: "",
  password: "",
};
export const defaultSignUpValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const defaultShippingAddress = {
  fullName: "",
  streetAddress: "",
  city: "",
  postalCode: "",
  country: "",
};

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(", ")
  : ["BenefitPay", "CashOnDelivery"];

export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || "BenefitPay";

  // so just a reminder that everything i take from .env file its a string
  export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 2;