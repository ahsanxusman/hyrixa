import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (!session.user.isAdmin) {
    redirect("/dashboard");
  }

  return session;
}
