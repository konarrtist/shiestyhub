import DashboardHeader from "@/components/layout-parts/dashboard-header"
import Sidebar from "@/components/layout-parts/sidebar"
import MobileNav from "@/components/layout-parts/mobile-nav"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/30 p-4">
          {children}
        </main>
      </div>
    </div>
  )
}