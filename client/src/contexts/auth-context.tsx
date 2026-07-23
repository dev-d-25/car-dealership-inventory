import { createContext, useContext, useCallback, type ReactNode } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { auth, type User } from "@/lib/api"
import { authKeys } from "@/lib/queries"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  // Query for current user
  const { data: meData, isLoading } = useQuery({
    queryKey: authKeys.me(),
    queryFn: () => auth.me(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const user = meData?.data?.user ?? null

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => auth.signIn(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), { data: { user: data.data } })
    },
  })

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) => auth.signUp(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), { data: { user: data.data } })
    },
  })

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: () => auth.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me(), null)
      queryClient.removeQueries({ queryKey: authKeys.all })
    },
  })

  const signIn = useCallback(async (email: string, password: string) => {
    await signInMutation.mutateAsync({ email, password })
  }, [signInMutation])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    await signUpMutation.mutateAsync({ name, email, password })
  }, [signUpMutation])

  const signOut = useCallback(async () => {
    await signOutMutation.mutateAsync()
  }, [signOutMutation])

  return (
    <AuthContext.Provider value={{ user, loading: isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
