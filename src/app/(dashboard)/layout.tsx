import { SessionGuard } from "@/components/layout/session-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <div className="flex flex-1 flex-col pb-16 md:pb-0">
          <Topbar />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
        <MobileNav />
      </div>
    </SessionGuard>
  )
}
