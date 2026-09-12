"use server";

import {
  signInFormSchema,
  createSignUpSchema,
  createShippingAddressSchema,
  createPaymentMethodSchema,
  createUpdateProfileSchema,
} from "../validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/lib/prisma";
import { formatError } from "@/lib/server-side-utils";
import { getLocale } from "next-intlayer/server";
import { ShippingAddress, paymentMethod } from "@/types";
import { PAGE_SIZE } from "@/lib/constants";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("You are not authorized to manage users.");
  }
  return session;
}

function revalidateAdminUsersPaths() {
  revalidatePath("/en/admin/users");
  revalidatePath("/ar/admin/users");
}

//Sign in user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData,
) {
  const locale = formData.get("locale") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || `/`;
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user, { redirectTo: callbackUrl });
    return {
      success: true,
      message:
        locale === "en" ? "Signed in successfully" : "تم تسجيل الدخول بنجاح",
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      success: false,
      message:
        locale === "en"
          ? "Invalid email or password"
          : "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    };
  }
}
//sign out user
export async function signOutUser() {
  const locale = await getLocale();
  await signOut({
    redirectTo: `/${locale}/sign-in`,
  });
}
//sign up user
export async function SignUpUser(prevState: unknown, formData: FormData) {
  const locale = await getLocale();
  const signUpFormSchema = await createSignUpSchema(locale);
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    const plainPassword = user.password;
    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });
    return { success: true, message: "User created successfully" };
  } catch (error) {
    // console.log(error.name);
    // console.log(error.code);
    // console.log(error.errors);
    // console.log(error.meta?.target);
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
}

//get user by the ID
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");
  return user;
}

//update the user address
export async function updateUserAddress(data: ShippingAddress) {
  const locale = await getLocale();
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });
    if (!currentUser) throw new Error("User not found");
    const ShippingAddressSchema = await createShippingAddressSchema(locale);
    const address = ShippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });
    return {
      success: true,
      message:
        locale === "en"
          ? "User updated successfully"
          : "تم تحديث المستخدم بنجاح",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

//update user payment method
export async function updateUserPaymentMethod(
  data: paymentMethod,
  locale: string,
) {
  try {
    const paymentMethodSchema = await createPaymentMethodSchema(locale);

    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });
    if (!currentUser) throw new Error("User not found");
    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });
    return {
      success: true,
      message:
        locale === "en"
          ? "User updated successfully"
          : "تم تحديث المستخدم بنجاح",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

//update the user profile
export async function updateProfile(
  user: { name: string; email: string },
  locale: string,
) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!user) throw new Error("user not found");
    const updateProfile = createUpdateProfileSchema(locale);
    const data = updateProfile.parse(user);
    await prisma.user.update({
      where: { id: currentUser?.id },
      data: { name: data.name /*email: user.email */ }, // can later add email if we want to update
    });
    return {
      success: true,
      message:
        locale === "en"
          ? "User updated successfully"
          : "تم تحديث المستخدم بنجاح",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// get all users (admin only, paginated)
export async function getAllUsers({
  limit = PAGE_SIZE,
  page = 1,
}: {
  limit?: number;
  page?: number;
}) {
  await requireAdmin();

  const [users, dataCount] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  return {
    data: users,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// delete a user (admin only)
export async function deleteUser(id: string, locale?: string) {
  try {
    const session = await requireAdmin();
    if (session?.user?.id === id) {
      return {
        success: false,
        message:
          locale === "ar"
            ? "لا يمكنك حذف حسابك الخاص."
            : "You cannot delete your own account.",
      };
    }

    await prisma.user.delete({ where: { id } });
    revalidateAdminUsersPaths();

    return {
      success: true,
      message: locale === "ar" ? "تم حذف المستخدم بنجاح." : "User deleted successfully.",
    };
  } catch (error) {
    return { success: false, message: await formatError(error) };
  }
}

// toggle a user's role between admin and user (admin only)
export async function updateUserRole(
  id: string,
  role: "admin" | "user",
  locale?: string,
) {
  try {
    const session = await requireAdmin();
    if (session?.user?.id === id) {
      return {
        success: false,
        message:
          locale === "ar"
            ? "لا يمكنك تغيير صلاحيتك الخاصة."
            : "You cannot change your own role.",
      };
    }

    await prisma.user.update({ where: { id }, data: { role } });
    revalidateAdminUsersPaths();

    return {
      success: true,
      message:
        locale === "ar" ? "تم تحديث صلاحية المستخدم." : "User role updated.",
    };
  } catch (error) {
    return { success: false, message: await formatError(error) };
  }
}
