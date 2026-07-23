import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RiCarLine } from "@remixicon/react"
import { ModeToggle } from "@/components/mode-toggle"
import { PasswordInput } from "@/components/password-input"
import { registerSchema } from "@/lib/schemas"
import { extractErrorMessage } from "@/lib/utils"

function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = registerSchema.safeParse({ name, email, password })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    try {
      await signUp(result.data.name, result.data.email, result.data.password)
      navigate({ to: "/" })
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-between items-center">
          <Link to="/" className="font-bold text-lg flex items-center gap-2">
            <RiCarLine className="size-5" />
            kata
          </Link>
          <ModeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Create account</CardTitle>
                <CardDescription>
                  Register to start browsing vehicles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <FieldGroup>
                    {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    <Field>
                      <FieldLabel htmlFor="name">Name</FieldLabel>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <PasswordInput id="password" value={password} onChange={setPassword} />
                    </Field>
                    <Field>
                      <Button type="submit" className="w-full">Create Account</Button>
                      <FieldDescription className="text-center">
                        Already have an account?{" "}
                        <Link to="/login" className="underline underline-offset-4">
                          Sign in
                        </Link>
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/login-bg.jpg"
          alt="Car showroom"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}

export const Route = createFileRoute("/_auth/register")({
  component: RegisterPage,
})
