"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../hooks/use-toast"
import { Eye, EyeOff, UserPlus, ArrowRight, Shield, Zap, Users, Target, CheckCircle } from "lucide-react"
import { Logo } from "../components/Logo"

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const p = formData.password
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[a-z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    setPasswordStrength(s)
  }, [formData.password])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure both password fields are identical.", variant: "destructive" })
      setIsLoading(false)
      return
    }
    if (passwordStrength < 3) {
      toast({ title: "Password too weak", description: "Use at least 8 characters with uppercase, lowercase, and numbers.", variant: "destructive" })
      setIsLoading(false)
      return
    }

    try {
      await register(formData.name, formData.email, formData.password, formData.confirmPassword)
      toast({ title: "Account created!", description: "Welcome to TaskFlow. Sign in to get started." })
      navigate("/login")
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const strengthColor = passwordStrength <= 2 ? "bg-red-500" : passwordStrength <= 3 ? "bg-yellow-500" : "bg-green-500"
  const strengthText  = passwordStrength <= 2 ? "Weak" : passwordStrength <= 3 ? "Medium" : "Strong"
  const strengthTextColor = passwordStrength <= 2 ? "text-red-400" : passwordStrength <= 3 ? "text-yellow-400" : "text-green-400"

  const perks = [
    { icon: Target, label: "Unlimited boards" },
    { icon: Users, label: "Team collaboration" },
    { icon: Zap,    label: "Real-time updates" },
    { icon: Shield, label: "Secure & private" },
  ]

  return (
    <div className="min-h-screen bg-[#050816] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-violet-950/80 via-[#080d1f] to-[#050816] border-r border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-violet-600 opacity-10 blur-[80px]" />
        </div>
        <Link to="/" aria-label="Back to home">
          <Logo size={36} showText />
        </Link>
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-4">What you get</p>
            <div className="grid grid-cols-2 gap-4">
              {perks.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-violet-400" aria-hidden="true" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>
          <blockquote>
            <p className="text-xl font-semibold text-white leading-snug">
              "We onboarded our entire team in under 10 minutes. It just works."
            </p>
            <footer className="mt-3 text-slate-400 text-sm">— An engineering manager</footer>
          </blockquote>
        </div>
        <p className="relative text-xs text-slate-600">
          &copy; {new Date().getFullYear()} <span translate="no">TaskFlow</span>
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-16 overflow-y-auto">
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
            <h1 className="text-3xl font-bold text-white">Create your account</h1>
            <p className="mt-2 text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Smith…"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500 focus-visible:border-violet-500"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <Input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com…"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500 focus-visible:border-violet-500"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password…"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500 focus-visible:border-violet-500 pr-11"
                  spellCheck={false}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus-visible:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      role="progressbar"
                      aria-valuenow={(passwordStrength / 5) * 100}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Password strength"
                    />
                  </div>
                  <span className={`text-xs font-medium ${strengthTextColor}`}>{strengthText}</span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password…"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500 focus-visible:border-violet-500 pr-20"
                  spellCheck={false}
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle className="absolute inset-y-0 right-10 my-auto h-4 w-4 text-green-400" aria-hidden="true" />
                )}
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus-visible:outline-none"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
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
                  Creating your account…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Create Account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-600">
            By creating an account you agree to our{" "}
            <button className="text-slate-500 hover:text-slate-400 underline transition-colors">Terms of Service</button>
            {" "}and{" "}
            <button className="text-slate-500 hover:text-slate-400 underline transition-colors">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
