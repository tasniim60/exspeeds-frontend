export const dynamic = "force-dynamic";
export const revalidate = 0;

import Navbar from "@/components/Navbar";
import AuthFooter from "@/components/AuthFooter";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50/80">
      <Navbar variant="auth" />
      <main className="flex-grow flex flex-col">{children}</main>
      <AuthFooter />
    </div>
  );
}
