"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Logo } from "@/components/logo"
import { AlertCircle, Eye, EyeOff, Loader2, Shield, Wrench, User } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const success = await login(email, password)
    if (success) {
      router.push("/")
    }
  }

  const handleDemoLogin = async (role: "employee" | "maintenance") => {
    clearError()
    const credentials =
      role === "employee"
        ? { email: "john@gearguard.com", password: "employee123" }
        : { email: "mike@gearguard.com", password: "maintenance123" }

    setEmail(credentials.email)
    setPassword(credentials.password)

    const success = await login(credentials.email, credentials.password)
    if (success) {
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Logo size="lg" showText />
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your GearGuard account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-secondary/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or try a demo account</span>
              </div>
            </div>

            <Tabs defaultValue="employee" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employee" className="gap-2">
                  <User className="h-4 w-4" />
                  Employee
                </TabsTrigger>
                <TabsTrigger value="maintenance" className="gap-2">
                  <Wrench className="h-4 w-4" />
                  Maintenance
                </TabsTrigger>
              </TabsList>
              <TabsContent value="employee" className="mt-4">
                <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-chart-1/10">
                      <User className="h-5 w-5 text-chart-1" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Employee Role</h4>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                        <li>• Create corrective and preventive requests</li>
                        <li>• View your own submitted requests</li>
                        <li>• Track request status</li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleDemoLogin("employee")}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login as Employee (John)"}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="maintenance" className="mt-4">
                <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Wrench className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Maintenance Role</h4>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                        <li>• View all maintenance requests</li>
                        <li>• Update request status and workflow</li>
                        <li>• Manage teams and equipment</li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleDemoLogin("maintenance")}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login as Maintenance (Mike)"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" />
                Secure authentication with role-based access
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
