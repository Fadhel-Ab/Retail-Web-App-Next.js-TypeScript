import { auth } from "@/auth";
import Link from "next/link";


const AdminDemo =  async ({ locale }: { locale: string }) => {
  const session = await auth();
  if (!session) {
    return (
        <Link href={`/${locale}/sign-in`} className="text-nowrap me-3">
          Admin Demo
        </Link>
    );
  }

    return (
      <Link href={`/${locale}/admin/overview`} className="text-nowrap me-3">
        Admin Dashboard
      </Link>
    );
}
 
export default AdminDemo;