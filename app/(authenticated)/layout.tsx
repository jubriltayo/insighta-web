import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { Sidebar } from "@/components/Sidebar";
import { ToastContainer } from "@/components/Toast";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-ink">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}