import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";

export default async function RootPage() {
  const user = await getServerUser();
  if (user) redirect("/dashboard");
  else redirect("/login");
}