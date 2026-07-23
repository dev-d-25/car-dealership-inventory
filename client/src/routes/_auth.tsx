import { createFileRoute, Outlet } from "@tanstack/react-router"

const AuthLayout = () => (
  <div className="min-h-screen bg-background">
    <Outlet />
  </div>
)

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
})
