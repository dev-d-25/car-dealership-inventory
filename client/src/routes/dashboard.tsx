import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

const DashboardLayout = () => {
  const { loading, isAuthorized } = useAuthGuard({ requireRole: ["admin", "superadmin"] })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 overflow-auto">
          <div className="py-6">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
})
