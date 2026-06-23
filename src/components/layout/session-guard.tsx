import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function SessionGuard({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/auth/signin")
  return <>{children}</>
}
