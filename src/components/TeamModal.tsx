"use client"
import { useState, useEffect } from "react"
import { Users, Settings, Crown, Calendar, Target, Sparkles, Send, X, Save, UserMinus, Trash2, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "../hooks/use-toast"
import { teamsAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { useState as useConfirmState } from "react"

interface TeamMember {
  id: string
  name: string
  role: "viewer" | "member" | "admin"
  avatar: string
  email?: string
  joinedAt?: string
}

interface Team {
  id: string
  name: string
  description: string
  members: TeamMember[]
  boards: number
  tasks: number
  owner: {
    id: string
    name: string
  }
  createdAt: string
  color?: string
}

interface TeamModalProps {
  team: Team
  isOpen: boolean
  onClose: () => void
  onUpdate: (team: Team) => void
}

export function TeamModal({ team, isOpen, onClose, onUpdate }: TeamModalProps) {
  const [editedTeam, setEditedTeam] = useState<Team>(team)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [confirmDelete, setConfirmDelete] = useConfirmState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()

  // Permissions: owner or admin of this team can manage
  const isOwner = editedTeam?.owner?.id === user?.id
  const currentMember = editedTeam?.members?.find((m) => m.id === user?.id)
  const isAdmin = currentMember?.role === "admin"
  const canManage = isOwner || isAdmin

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: ({ teamId, email }: { teamId: string; email: string }) =>
      teamsAPI.inviteMember(teamId, email),
    onSuccess: (response, variables) => {
      const isResend = response?.message?.includes('resent')
      toast({
        title: isResend ? "Invitation Resent!" : "Invitation Sent!",
        description: isResend
          ? `A new invitation link has been sent to ${variables.email}`
          : `An invitation has been sent to ${variables.email}`,
      })
      setNewMemberEmail("")
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send invitation",
        variant: "destructive",
      })
    },
  })

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamsAPI.removeMember(teamId, userId),
    onSuccess: (_, variables) => {
      toast({ title: "Member Removed", description: "The member has been removed from the team." })
      setEditedTeam((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== variables.userId),
      }))
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" })
    },
  })

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: (teamId: string) => teamsAPI.deleteTeam(teamId),
    onSuccess: () => {
      toast({ title: "Team Deleted", description: "The team has been permanently deleted." })
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      onClose()
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete team.", variant: "destructive" })
    },
  })

  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: any }) =>
      teamsAPI.updateTeam(teamId, data),
    onSuccess: () => {
      toast({ title: "Team Updated", description: "Team settings saved successfully." })
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update team.", variant: "destructive" })
    },
  })

  // Update member role mutation
  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ teamId, userId, role }: { teamId: string; userId: string; role: string }) =>
      teamsAPI.updateMemberRole(teamId, userId, role),
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: "Member role updated successfully",
      })

  // Aggressive cache invalidation (react-query v3 signatures)
  queryClient.invalidateQueries({ queryKey: ["teams"] }) 
  queryClient.invalidateQueries({ queryKey: ["user-teams"] }) 
  queryClient.invalidateQueries({ queryKey: ["board-teams"] }) 

  // Force refetch
  queryClient.refetchQueries({ queryKey: ["teams"] }) 

      // Update the local state immediately
      setEditedTeam((prev) => ({
        ...prev,
        members: prev.members.map((member) =>
          member.id === variables.userId ? { ...member, role: variables.role as any } : member,
        ),
      }))
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      })
    },
  })

  const handleUpdateMemberRole = (teamId: string, memberId: string, newRole: string) => {
    if (!canManage) return
    updateMemberRoleMutation.mutate({
      teamId,
      userId: memberId,
      role: newRole,
    })
  }

  const handleInviteMember = () => {
    if (!canManage || !newMemberEmail.trim()) return
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newMemberEmail)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" })
      return
    }
    inviteMemberMutation.mutate({ teamId: team.id, email: newMemberEmail })
  }

  useEffect(() => {
    setEditedTeam(team)
  }, [team])

  const handleSave = () => {
    updateTeamMutation.mutate({
      teamId: team.id,
      data: { name: editedTeam.name, description: editedTeam.description, color: editedTeam.color },
    })
    onUpdate(editedTeam)
    onClose()
  }

  const getTeamColorConfig = (color?: string) => {
    switch (color) {
      case "blue":
        return {
          gradient: "from-blue-500 to-cyan-500",
          bg: "from-blue-500/10 to-cyan-500/10",
          border: "border-blue-500/20",
          text: "text-blue-400",
        }
      case "purple":
        return {
          gradient: "from-purple-500 to-pink-500",
          bg: "from-purple-500/10 to-pink-500/10",
          border: "border-purple-500/20",
          text: "text-purple-400",
        }
      case "green":
        return {
          gradient: "from-green-500 to-emerald-500",
          bg: "from-green-500/10 to-emerald-500/10",
          border: "border-green-500/20",
          text: "text-green-400",
        }
      default:
        return {
          gradient: "from-gray-500 to-slate-500",
          bg: "from-gray-500/10 to-slate-500/10",
          border: "border-gray-500/20",
          text: "text-slate-400",
        }
    }
  }

  const colorConfig = getTeamColorConfig(editedTeam.color)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col bg-[#0d1224] border border-white/10 shadow-2xl text-white">
        {/* Header */}
        <DialogHeader className="pb-0">
          <div
            className={`p-4 -m-6 mb-4 bg-gradient-to-r ${colorConfig.bg} border-b-2 ${colorConfig.border} relative overflow-hidden`}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative z-10">
              <DialogTitle className="flex items-center space-x-3 text-2xl font-bold text-white">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Users className="h-6 w-6 text-slate-300" />
                </div>
                <span>{editedTeam.name}</span>
                <Crown className="h-6 w-6 text-yellow-500" />
              </DialogTitle>
              <p className="text-slate-400 mt-2">{editedTeam.description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {!canManage && (
            <div className="mx-6 mb-4 p-3 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-300 text-sm">
              View only: you don't have permission to manage this team. Contact an admin or the owner.
            </div>
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Eye className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                Members
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Team Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Team Members</p>
                        <p className="text-2xl font-bold">{editedTeam.members.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-200" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Active Boards</p>
                        <p className="text-2xl font-bold">{editedTeam.boards}</p>
                      </div>
                      <Target className="h-8 w-8 text-purple-200" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Total Tasks</p>
                        <p className="text-2xl font-bold">{editedTeam.tasks}</p>
                      </div>
                      <Sparkles className="h-8 w-8 text-green-200" />
                    </div>
                  </div>
                </div>

                {/* Team Description */}
                <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
                  <h3 className="text-lg font-bold text-white mb-3">About This Team</h3>
                  <p className="text-slate-300 leading-relaxed">{editedTeam.description}</p>
                  <div className="mt-4 flex items-center space-x-4 text-sm text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(editedTeam.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Crown className="h-4 w-4" />
                      <span>Owned by {editedTeam.owner.name}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Members */}
                <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
                  <h3 className="text-lg font-bold text-white mb-4">Team Members</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {editedTeam.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-3 p-3 bg-white/[0.04] rounded-lg"
                      >
                        <Avatar className="h-12 w-12 ring-2 ring-white/10">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-white">{member.name}</p>
                            {member.role === "admin" && <Crown className="h-4 w-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-slate-400 capitalize">{member.role}</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            member.role === "admin" ? "bg-amber-500/15 text-amber-300" : "bg-blue-500/15 text-blue-300"
                          }
                        >
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="members" className="space-y-6 mt-0">
                {/* Invite New Member */}
                <div className="bg-violet-500/5 p-6 rounded-xl border border-violet-500/20">
                  <h3 className="text-lg font-bold text-white mb-4">Invite New Member</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    Enter an email address to invite someone to join your team. If they didn't receive the first invitation, you can resend it anytime.
                  </p>
                  <div className="flex space-x-3">
                    <Input
                      placeholder="Enter email address (safe to resend)"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleInviteMember()
                        }
                      }}
                      className="flex-1 bg-white/5 border border-white/10 focus:border-violet-500 text-white placeholder:text-slate-500"
                      disabled={!canManage}
                    />
                    <Button
                      onClick={handleInviteMember}
                      disabled={!canManage || !newMemberEmail.trim() || inviteMemberMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60"
                      title={!canManage ? "Only admins or the owner can invite members" : undefined}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {inviteMemberMutation.isPending ? "Sending..." : "Send Invite"}
                    </Button>
                  </div>
                </div>

                {/* Members List */}
                <div className="space-y-4">
                  {editedTeam.members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 ring-2 ring-white/10">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-white">{member.name}</p>
                            {member.role === "admin" && <Crown className="h-4 w-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-slate-400">
                            {member.email || `${member.name.toLowerCase().replace(" ", ".")}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={member.role}
                          onValueChange={(newRole) => handleUpdateMemberRole(team.id, member.id, newRole)}
                          disabled={updateMemberRoleMutation.isPending || !canManage || member.id === editedTeam.owner.id}
                        >
                          <SelectTrigger className="w-32 bg-white/5 border border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0d1224] border border-white/10 text-white">
                            <SelectItem value="viewer">👁️ Viewer</SelectItem>
                            <SelectItem value="member">👤 Member</SelectItem>
                            <SelectItem value="admin">⚡ Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:bg-red-500/10"
                          disabled={!canManage || member.id === editedTeam.owner.id || removeMemberMutation.isPending}
                          title={!canManage ? "Only admins or the owner can remove members" : member.id === editedTeam.owner.id ? "Owner cannot be removed" : "Remove member"}
                          onClick={() => removeMemberMutation.mutate({ teamId: team.id, userId: member.id })}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-0">
                {/* Team Settings */}
                <div className="space-y-6">
                  <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
                    <h3 className="text-lg font-bold text-white mb-4">Team Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-slate-300 mb-2 block">Team Name</label>
                        <Input
                          value={editedTeam.name}
                          onChange={(e) => setEditedTeam({ ...editedTeam, name: e.target.value })}
                          className="bg-white/5 border border-white/10 focus:border-violet-500 text-white"
                          disabled={!canManage}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-300 mb-2 block">Description</label>
                        <Textarea
                          value={editedTeam.description}
                          onChange={(e) => setEditedTeam({ ...editedTeam, description: e.target.value })}
                          rows={3}
                          className="bg-white/5 border border-white/10 focus:border-violet-500 text-white"
                          disabled={!canManage}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-300 mb-2 block">Team Color</label>
                        <Select
                          value={editedTeam.color}
                          onValueChange={(value) => setEditedTeam({ ...editedTeam, color: value })}
                          disabled={!canManage}
                        >
                          <SelectTrigger className="bg-white/5 border border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0d1224] border border-white/10 text-white">
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  {isOwner && (
                  <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20">
                    <h3 className="text-lg font-bold text-red-300 mb-4">Danger Zone</h3>
                    <div className="space-y-3">
                      <p className="text-red-300/80 text-sm">
                        Once you delete a team, there is no going back. Please be certain.
                      </p>
                      {!confirmDelete ? (
                        <Button
                          variant="destructive"
                          className="bg-gradient-to-r from-red-600 to-pink-600"
                          onClick={() => setConfirmDelete(true)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Team
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <p className="text-red-300 font-semibold text-sm">Are you sure?</p>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deleteTeamMutation.isPending}
                            onClick={() => deleteTeamMutation.mutate(team.id)}
                          >
                            {deleteTeamMutation.isPending ? "Deleting..." : "Yes, Delete"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6 mt-0">
                <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
                  <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                  <div className="text-center py-12">
                    <div className="p-4 bg-white/5 rounded-full w-16 h-16 mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-slate-500 mx-auto" />
                    </div>
                    <p className="text-slate-400 text-lg font-medium mb-2">No recent activity</p>
                    <p className="text-slate-500 text-sm">
                      Team activity will appear here when members interact with boards and tasks.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Action Buttons */}
    <div className="flex justify-end space-x-3 p-6 border-t border-white/[0.06]">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-transparent border border-white/15 text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button
            onClick={handleSave}
      disabled={!canManage}
      title={!canManage ? "No changes allowed. You are in view-only mode." : undefined}
      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-60"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
