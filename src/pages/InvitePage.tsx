import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, Users, CheckCircle, XCircle, Mail } from "lucide-react"
import { authAPI } from "../services/api"
import logger from "../lib/logger"

interface InvitationDetails {
  id: string
  team: {
    id: string
    name: string
    description: string
  }
  inviter: {
    name: string
    email: string
  }
  // The email the invitation was sent to (optional if not provided by the API)
  email?: string
  role: string
  expires_at: string
  status: string
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const { user, login } = useAuth()
  const navigate = useNavigate()
  
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form fields for non-authenticated users
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    fetchInvitationDetails()
  }, [token])

  const fetchInvitationDetails = async () => {
    if (!token) {
      setError("Invalid invitation link")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/invitations/${token}`)
      const data = await response.json()
      
      if (data.success) {
        setInvitation(data.data)
      } else {
        setError(data.message || "Failed to load invitation")
      }
    } catch (err: any) {
      logger.error("Failed to fetch invitation details:", err)
      setError("Failed to load invitation details")
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!token) return

    setAccepting(true)
    try {
      const response = await authAPI.acceptInvitation(token)
      setSuccess(true)
      
      // Redirect to team dashboard after 2 seconds
      setTimeout(() => {
        navigate(`/teams/${invitation?.team.id}`)
      }, 2000)
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to accept invitation")
    } finally {
      setAccepting(false)
    }
  }

  const handleLoginAndAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    setAccepting(true)

    try {
      await login(email, password)
      // After successful login, accept the invitation
      await handleAcceptInvitation()
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed")
      setAccepting(false)
    }
  }

  const handleRegisterAndAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    setAccepting(true)

    try {
      // Register with the invitation email
      await authAPI.register(name, email, password, password)
      setSuccess(true)
      
      // Auto-acceptance should happen during registration
      setTimeout(() => {
        navigate(`/teams/${invitation?.team.id}`)
      }, 2000)
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed")
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading invitation...</span>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-green-600">Welcome to the Team!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>You've successfully joined <strong>{invitation?.team.name}</strong>!</p>
            <p className="text-sm text-gray-600 mt-2">Redirecting you to the team dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Users className="h-12 w-12 text-blue-500 mx-auto mb-2" />
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription>
            {invitation.inviter.name} has invited you to join <strong>{invitation.team.name}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {invitation.team.description && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm text-gray-700">About this team:</h4>
              <p className="text-sm text-gray-600">{invitation.team.description}</p>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p><strong>Role:</strong> {invitation.role}</p>
            <p><strong>Expires:</strong> {new Date(invitation.expires_at).toLocaleDateString()}</p>
          </div>

          {error && (
            <Alert>
              <AlertDescription className="text-red-600">{error}</AlertDescription>
            </Alert>
          )}

          {user ? (
            // User is already logged in
            <div className="space-y-4">
              {user.email === invitation.email ? (
                <Button 
                  onClick={handleAcceptInvitation} 
                  disabled={accepting}
                  className="w-full"
                >
                  {accepting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Accept Invitation
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-red-600 mb-3">
                    This invitation is for {invitation.email}, but you're logged in as {user.email}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/logout">Log out and try again</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // User needs to login or register
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Button
                  variant={isRegistering ? "outline" : "default"}
                  onClick={() => setIsRegistering(false)}
                  className="flex-1"
                >
                  Login
                </Button>
                <Button
                  variant={isRegistering ? "default" : "outline"}
                  onClick={() => setIsRegistering(true)}
                  className="flex-1"
                >
                  Sign Up
                </Button>
              </div>

              <form onSubmit={isRegistering ? handleRegisterAndAccept : handleLoginAndAccept} className="space-y-3">
                {isRegistering && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder={invitation.email}
                  />
                  <p className="text-xs text-gray-500 mt-1">Use {invitation.email} to accept this invitation</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <Button type="submit" disabled={accepting} className="w-full">
                  {accepting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isRegistering ? "Sign Up & Join Team" : "Login & Join Team"}
                </Button>
              </form>
            </div>
          )}
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-xs text-gray-500">
            Having trouble? <a href="mailto:support@taskflow.com" className="text-blue-500 hover:underline">Contact support</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
