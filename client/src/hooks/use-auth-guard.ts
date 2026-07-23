import { useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useAuth } from "@/contexts/auth-context"

interface UseAuthGuardOptions {
  requireRole?: string | string[]
}

export function useAuthGuard({ requireRole }: UseAuthGuardOptions = {}) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const roles = Array.isArray(requireRole) ? requireRole : requireRole ? [requireRole] : []

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate({ to: "/login" })
      return
    }
    if (roles.length > 0 && !roles.includes(user.role)) {
      navigate({ to: "/" })
    }
  }, [user, loading, navigate, roles])

  const isAuthorized = !loading && user && (roles.length === 0 || roles.includes(user.role))

  return { user, loading, isAuthorized }
}
