"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../hooks/use-toast"
import { Eye, EyeOff, LogIn, ArrowRight, Shield, Zap } from "lucide-react"
import { Logo } from "../components/Logo"
import logger from "../lib/logger"
import { authAPI } from "../services/api"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const { user, login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
    logger.log("🔍 LoginPage useEffect - user:", user)
    if (user) {
      logger.log("✅ User found in LoginPage, redirecting to dashboard:", user)
      navigate("/dashboard", { replace: true })
    }
  }, [user, navigate])

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    try {
      await authAPI.forgotPassword(forgotEmail)
      toast({ title: "Reset link sent", description: "Check your email for a password reset link." })
      setShowForgotPassword(false)
      setForgotEmail("")
    } catch (error: any) {
      toast({
        title: "Request failed",
        description: error.response?.data?.message || "Could not send reset email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setForgotLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      logger.log("🚀 Attempting login...")
      await login(email, password)
      logger.log("✅ Login function completed successfully")
      toast({ title: "Welcome back!", description: "Successfully signed in to TaskFlow." })
      setTimeout(() => {
        logger.log("⏰ Navigating to dashboard...")
        navigate("/dashboard", { replace: true })
      }, 100)
    } catch (error: any) {
      logger.error("❌ Login failed:", error)
      toast({
        title: "Sign in failed",
        description: error.response?.data?.message || error.message || "Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050816] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-violet-950/80 via-[#080d1f] to-[#050816] border-r border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-violet-600 opacity-10 blur-[80px]" />
        </div>
        <Link to="/" aria-label="Back to home">
          <Logo size={36} showText />
        </Link>
        <div className="relative z-10 space-y-8">
          <blockquote>
            <p className="text-2xl font-semibold text-white leading-snug">
              "TaskFlow cut our sprint planning time in half. The drag-and-drop is buttery smooth."
            </p>
            <footer className="mt-4 text-slate-400 text-sm">— A happy team lead</footer>
          </blockquote>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Zap, label: "Lightning-fast boards" },
              { icon: Shield, label: "Secure by default" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-slate-400 text-sm">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-violet-400" aria-hidden="true" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-slate-600">
          &copy; {new Date().getFullYear()} <span translate="no">TaskFlow</span>
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-16">
        <div
          className={`w-full max-w-md transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link to="/" aria-label="Back to home">
              <Logo size={32} showText />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="mt-2 text-slate-400 text-sm">
              Sign in to continue to your workspace.{" "}
              <Link
                to="/register"
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
              >
                Don't have an account?
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com…"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500 focus-visible:border-violet-500"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                  onClick={() => setShowForgotPassword((v) => !v)}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password…"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500 focus-visible:border-violet-500 pr-11"
                  spellCheck={false}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus-visible:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                    : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Forgot password inline */}
            {showForgotPassword && (
              <form
                onSubmit={handleForgotPassword}
                className="p-4 rounded-xl bg-violet-900/20 border border-violet-500/20 space-y-3"
              >
                <p className="text-sm text-slate-300 font-medium">Enter your email to receive a reset link:</p>
                <Input
                  type="email"
                  autoComplete="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com…"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500"
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={forgotLoading}
                    className="bg-violet-600 hover:bg-violet-500 text-white text-sm"
                  >
                    {forgotLoading ? "Sending…" : "Send Reset Link"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-sm border-white/10 text-slate-300 hover:bg-white/5"
                    onClick={() => { setShowForgotPassword(false); setForgotEmail("") }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-violet-500 focus:ring-offset-0"
              />
              <label htmlFor="remember-me" className="text-sm text-slate-400">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-violet-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
                  Signing you in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Sign In
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-600">
            By signing in you agree to our{" "}
            <button className="text-slate-500 hover:text-slate-400 underline transition-colors">Terms of Service</button>
            {" "}and{" "}
            <button className="text-slate-500 hover:text-slate-400 underline transition-colors">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
