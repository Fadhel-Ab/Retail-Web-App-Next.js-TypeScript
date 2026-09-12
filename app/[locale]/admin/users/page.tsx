import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import { getAllUsers } from "@/lib/actions/users.actions";
import { formatDateTime } from "@/lib/utils";
import { auth } from "@/auth";
import { Metadata } from "next";
import UserActions from "./user-actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === "en" ? "Admin Users" : "مستخدمو المشرف",
  };
}

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const session = await auth();
  const { data: users, totalPages } = await getAllUsers({
    limit: 10,
    page: currentPage,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {locale === "en" ? "Users" : "المستخدمون"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === "en"
            ? "Manage every account registered in your store."
            : "إدارة جميع الحسابات المسجلة في متجرك."}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">
                {locale === "en" ? "Name" : "الاسم"}
              </TableHead>
              <TableHead className="text-start">
                {locale === "en" ? "Email" : "البريد الإلكتروني"}
              </TableHead>
              <TableHead className="text-start">
                {locale === "en" ? "Role" : "الصلاحية"}
              </TableHead>
              <TableHead className="text-start">
                {locale === "en" ? "Joined" : "تاريخ الانضمام"}
              </TableHead>
              <TableHead className="text-end pe-14">
                {locale === "en" ? "Actions" : "الإجراءات"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {locale === "en" ? "No users found." : "لا يوجد مستخدمون."}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    {user.role === "admin" ? (
                      <Badge className="bg-brand text-brand-foreground hover:bg-brand">
                        {locale === "en" ? "Admin" : "مشرف"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {locale === "en" ? "User" : "مستخدم"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(new Date(user.createdAt)).dateOnly}
                  </TableCell>
                  <TableCell>
                    <UserActions
                      id={user.id}
                      role={user.role}
                      locale={locale}
                      isSelf={user.id === session?.user?.id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination page={currentPage} totalPages={totalPages} locale={locale} />
      )}
    </div>
  );
}
