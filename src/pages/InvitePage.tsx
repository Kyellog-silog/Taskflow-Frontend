"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { authAPI } from "../services/api"
import { LandingNav } from "../components/LandingNav"
import { Logo } from "../components/Logo"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { Button } from "../components/ui/button"
import { Users, CheckCircle, XCircle, AlertCircle, Eye, EyeOff, Shield } from "lucide-react"

interface InvitationPreview {
  id: string
  email: string
  team_name: string
  team_description?: string
  role: string
  status: string
  expires_at: string
  invited_by: string
  team_owner: string
  is_expired: boolean
  is_pending: boolean
}

type View = "loading" | "error" | "logged-in" | "auth" | "success" | "declined"

const roleBadge: Record<string, string> = {
  owner:  "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  admin:  "bg-violet-500/15 text-violet-400 border border-violet-500/20",
  member: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  viewer: "bg-slate-500/15 text-slate-400 border border-slate-500/20",
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const { user, login, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [view, setView] = useState<View>("loading")
  const [invitation, setInvitation] = useState<InvitationPreview | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  // Auth tab state
  const [authTab, setAuthTab] = useState<"register" | "login">("register")

  // Form fields
  const [name, setName] = useState("")
  const [loginEmail, setLoginEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const fetchInvitation = useCallback(async () => {
    if (!token) {
      setErrorMsg("Invalid invitation link.")
      setView("error")
      return
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/invitations/${token}`, {
        headers: { Accept: "application/json" },
      })
      const data = await res.json()

      if (!data.success) {
        setErrorMsg(data.message || "Invitation not found.")
        setView("error")
        return
      }

      if (data.data.is_expired || !data.data.is_pending) {
        const reason = data.data.is_expired
          ? "This invitation has expired."
          : `This invitation has already been ${data.data.status}.`
        setErrorMsg(reason)
        setView("error")
        return
      }

      setInvitation(data.data)
      setLoginEmail(data.data.email)
    } catch {
      setErrorMsg("Failed to load invitation details. Please try again.")
      setView("error")
    }
  }, [token])

  useEffect(() => {
    fetchInvitation()
  }, [fetchInvitation])

  // Resolve view once both invitation and auth state are ready
  useEffect(() => {
    if (!invitation) return
    setView(user ? "logged-in" : "auth")
  }, [invitation, user])

  // Accept (logged-in path)
  const handleAccept = async () => {
    if (!token) return
    setSubmitting(true)
    setFormError("")
    try {
      await authAPI.acceptInvitation(token)
      setView("success")
      setTimeout(() => navigate("/dashboard"), 2000)
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to accept invitation.")
    } finally {
      setSubmitting(false)
    }
  }

  // Decline (logged-in path)
  const handleDecline = async () => {
    if (!token) return
    setSubmitting(true)
    setFormError("")
    try {
      await authAPI.rejectInvitation(token)
      setView("declined")
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to decline invitation.")
    } finally {
      setSubmitting(false)
    }
  }

  // Login then accept
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setSubmitting(true)
    try {
      await login(loginEmail, password)
      await authAPI.acceptInvitation(token!)
      setView("success")
      setTimeout(() => navigate("/dashboard"), 2000)
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Login failed. Please check your credentials.")
    } finally {
      setSubmitting(false)
    }
  }

  // Register new account and accept
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    if (password !== confirm) { setFormError("Passwords do not match."); return }
    if (password.length < 8) { setFormError("Password must be at least 8 characters."); return }
    setSubmitting(true)
    try {
      await authAPI.registerAndAccept(token!, name, password, confirm)
      await refreshUser()
      setView("success")
      setTimeout(() => navigate("/dashboard"), 2000)
    } catch (err: any) {
      if (err.response?.status === 409) {
        setAuthTab("login")
        setFormError("An account already exists with this email. Please log in instead.")
      } else {
        setFormError(err.response?.data?.message || "Registration failed. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const switchTab = (tab: "register" | "login") => {
    setAuthTab(tab)
    setFormError("")
    setPassword("")
    setConfirm("")
  }

  // ── LOADING ──
  if (view === "loading") {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner />
          <p className="text-slate-400 text-sm animate-pulse">Loading invitation…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col">
      <LandingNav />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-24 relative z-10">
        <div className="w-full max-w-md">

          <div className="flex justify-center mb-8">
            <Logo size={36} showText />
          </div>

          {/* ── ERROR ── */}
          {view === "error" && (
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-7 w-7 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Invitation Unavailable</h2>
              <p className="text-slate-400 text-sm mb-6">{errorMsg}</p>
              <Button asChild className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl">
                <Link to="/login">Go to Login</Link>
              </Button>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {view === "success" && (
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Welcome to the Team!</h2>
              <p className="text-slate-400 text-sm">
                You've joined{" "}
                <span className="text-white font-medium">{invitation?.team_name}</span>.{" "}
                Redirecting to your dashboard…
              </p>
            </div>
          )}

          {/* ── DECLINED ── */}
          {view === "declined" && (
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-500/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-7 w-7 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Invitation Declined</h2>
              <p className="text-slate-400 text-sm mb-6">
                You've declined the invitation to join{" "}
                <span className="text-white font-medium">{invitation?.team_name}</span>.
              </p>
              <Button asChild variant="outline" className="w-full border-white/10 text-slate-300 hover:bg-white/5 rounded-xl">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          )}

          {/* ── MAIN CARD ── */}
          {(view === "logged-in" || view === "auth") && invitation && (
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">

              {/* Team info header */}
              <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 mb-0.5">
                      <span className="text-slate-300 font-medium">{invitation.invited_by}</span> invited you to join
                    </p>
                    <h1 className="text-xl font-bold text-white truncate">{invitation.team_name}</h1>
                    {invitation.team_description && (
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{invitation.team_description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge[invitation.role] || roleBadge.member}`}>
                    {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                  </span>
                  <span className="text-xs text-slate-500">
                    Expires {new Date(invitation.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Action area */}
              <div className="p-6 space-y-4">

                {formError && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* ── LOGGED-IN VIEW ── */}
                {view === "logged-in" && (
                  user?.email === invitation.email ? (
                    <div className="space-y-3">
                      <p className="text-slate-500 text-xs text-center">
                        Accepting as <span className="text-slate-300 font-medium">{user.email}</span>
                      </p>
                      <Button
                        onClick={handleAccept}
                        disabled={submitting}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-2.5"
                      >
                        {submitting ? "Joining…" : `Accept & Join ${invitation.team_name}`}
                      </Button>
                      <Button
                        onClick={handleDecline}
                        disabled={submitting}
                        variant="ghost"
                        className="w-full text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-xl text-sm"
                      >
                        Decline Invitation
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>
                          This invitation is for <strong>{invitation.email}</strong>, but you're signed in as <strong>{user?.email}</strong>.
                          Please log out and use the correct account.
                        </span>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-white/10 text-slate-300 hover:bg-white/5 rounded-xl"
                      >
                        <Link to="/login">Switch Account</Link>
                      </Button>
                    </div>
                  )
                )}

                {/* ── NOT LOGGED IN VIEW ── */}
                {view === "auth" && (
                  <div className="space-y-4">

                    {/* Tab switcher */}
                    <div className="flex rounded-xl bg-white/[0.04] border border-white/[0.06] p-1">
                      <button
                        type="button"
                        onClick={() => switchTab("register")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                          authTab === "register"
                            ? "bg-violet-600 text-white shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Create Account
                      </button>
                      <button
                        type="button"
                        onClick={() => switchTab("login")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                          authTab === "login"
                            ? "bg-violet-600 text-white shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Log In
                      </button>
                    </div>

                    {/* REGISTER */}
                    {authTab === "register" && (
                      <form onSubmit={handleRegister} className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your name"
                            required
                            autoComplete="name"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                          <div className="relative">
                            <input
                              type="email"
                              value={invitation.email}
                              readOnly
                              tabIndex={-1}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-500 text-sm cursor-not-allowed pr-10"
                            />
                            <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-700" />
                          </div>
                          <p className="text-xs text-slate-700 mt-1">Locked to this invitation.</p>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              placeholder="Min. 8 characters"
                              required
                              autoComplete="new-password"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50 transition pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(s => !s)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Password</label>
                          <input
                            type="password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            placeholder="Repeat your password"
                            required
                            autoComplete="new-password"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50 transition"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={submitting}
                          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-2.5 mt-1"
                        >
                          {submitting ? "Creating account…" : "Create Account & Join Team"}
                        </Button>
                      </form>
                    )}

                    {/* LOGIN */}
                    {authTab === "login" && (
                      <form onSubmit={handleLogin} className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={e => setLoginEmail(e.target.value)}
                            placeholder={invitation.email}
                            required
                            autoComplete="email"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              placeholder="Your password"
                              required
                              autoComplete="current-password"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50 transition pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(s => !s)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={submitting}
                          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-2.5 mt-1"
                        >
                          {submitting ? "Logging in…" : "Log In & Accept Invitation"}
                        </Button>
                      </form>
                    )}

                    <p className="text-xs text-center text-slate-600">
                      By accepting, you agree to TaskFlow's{" "}
                      <Link to="/" className="text-slate-500 hover:text-slate-300 underline underline-offset-2">
                        terms of service
                      </Link>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
