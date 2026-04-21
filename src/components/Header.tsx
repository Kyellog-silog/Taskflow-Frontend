"use client"

import React from "react"
import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Bell, Search, Plus, Menu, X, LayoutDashboard, Kanban, Users, User, Settings, LogOut } from "lucide-react"
import { CreateTaskModal } from "./CreateTaskModal"
import { useTasks } from "../hooks/useTasks"
import { useToast } from "../hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { boardsAPI, teamsAPI, notificationsAPI } from "../services/api"
import { storageService } from "../services/storage"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Logo } from "./Logo"

const appNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Boards",    href: "/boards",    icon: Kanban },
  { label: "Teams",     href: "/teams",     icon: Users },
]

export const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false)
  const [newBoard, setNewBoard] = useState({ name: "", description: "" })
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")

  const boardId = location.pathname.startsWith("/boards/") ? location.pathname.split("/")[2] : undefined
  const { createTask } = useTasks(boardId)

  const createBoardMutation = useMutation(boardsAPI.createBoard, {
    onSuccess: (data) => {
      queryClient.invalidateQueries("boards")
      setIsCreateBoardModalOpen(false)
      setNewBoard({ name: "", description: "" })
      toast({ title: "Board created", description: "Your new board is ready." })
      if (data?.id) navigate(`/boards/${data.id}`)
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to create board", variant: "destructive" })
    },
  })

  const { data: teamsData } = useQuery({ queryKey: ["teams"], queryFn: teamsAPI.getTeams, staleTime: 5 * 60 * 1000 })

  const prevUnreadRef = React.useRef<number>(0)
  const { data: unreadCountData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationsAPI.getUnreadCount,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    onSuccess: (data) => {
      try {
        const current = data?.data?.count ?? 0
        if (current > prevUnreadRef.current) {
          const soundOn = storageService.getItem<boolean>("notif_sound_enabled") ?? true
          const volume = (storageService.getItem<number>("notif_sound_volume") ?? 70) / 100
          if (soundOn) { const a = new Audio("/sounds/notify.mp3"); a.volume = volume; a.play().catch(() => {}) }
        }
        prevUnreadRef.current = current
      } catch {}
    },
  })
  const unreadCount = unreadCountData?.data?.count ?? 0

  const { data: notificationsList } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationsAPI.list(10),
    staleTime: 30 * 1000,
  })

  const markAllReadMutation = useMutation(notificationsAPI.markAllRead, {
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications", "unread-count"])
      queryClient.invalidateQueries(["notifications", "list"])
    },
  })

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBoard.name.trim()) return
    createBoardMutation.mutate({
      ...newBoard,
      ...(selectedTeamId && { team_id: selectedTeamId }),
      columns: [
        { title: "To Do", id: "todo", color: "blue-500" },
        { title: "In Progress", id: "in-progress", color: "yellow-500" },
        { title: "Review", id: "review", color: "purple-500" },
        { title: "Done", id: "done", color: "green-500" },
      ],
    })
  }

  const handleLogout = async () => { await logout(); navigate("/login") }

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const renderNotificationText = (n: any) => {
    switch (n.type) {
      case "task.assigned":  return "You've been assigned to a task."
      case "task.completed": return "A task was marked as completed."
      case "comment.created": return "New comment on a task you're involved in."
      default: return "Update in your workspace."
    }
  }

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + "/")

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#080d1f]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-4">

            {/* Logo */}
            <Link to="/dashboard" className="flex-shrink-0" aria-label="TaskFlow dashboard">
              <Logo size={28} showText />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {appNav.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    isActive(href)
                      ? "bg-violet-600/15 text-violet-400"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Search */}
            <div className="hidden lg:flex flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search tasks, boards…"
                  aria-label="Search"
                  className="w-full pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">

              {/* Create dropdown */}
              <DropdownMenu open={isCreateMenuOpen} onOpenChange={setIsCreateMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="hidden sm:flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium shadow-lg shadow-violet-900/30 transition-colors"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Create
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 bg-[#0d1224] border border-white/10 shadow-2xl">
                  {[
                    { label: "New Task",  dot: "bg-violet-500", action: () => { setIsCreateTaskModalOpen(true); setIsCreateMenuOpen(false) } },
                    { label: "New Board", dot: "bg-blue-500",   action: () => { setIsCreateBoardModalOpen(true); setIsCreateMenuOpen(false) } },
                    { label: "New Team",  dot: "bg-green-500",  action: () => { navigate("/teams"); setIsCreateMenuOpen(false) } },
                  ].map(({ label, dot, action }) => (
                    <DropdownMenuItem key={label} onClick={action} className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer">
                      <span className={`w-2 h-2 rounded-full ${dot}`} aria-hidden="true" />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`} className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                    <Bell className="h-4.5 w-4.5" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-[#0d1224] border border-white/10 shadow-2xl p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <DropdownMenuLabel className="text-white font-semibold p-0">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                      <button
                        className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                        onClick={() => markAllReadMutation.mutate()}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto" role="list" aria-label="Notifications list">
                    {(notificationsList?.data?.length ?? 0) === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="h-8 w-8 text-slate-600 mx-auto mb-2" aria-hidden="true" />
                        <p className="text-sm text-slate-500">No notifications</p>
                        <p className="text-xs text-slate-600 mt-1">You&apos;re all caught up!</p>
                      </div>
                    ) : (
                      notificationsList?.data?.map((n: any) => (
                        <div key={n.id} role="listitem" className="px-4 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] transition-colors">
                          <div className="flex items-start gap-3">
                            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${n.read_at ? "bg-slate-600" : "bg-violet-500"}`} aria-hidden="true" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-300">{renderNotificationText(n)}</p>
                              <p className="text-xs text-slate-600 mt-1">{new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" }).format(new Date(n.created_at))}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 hover:ring-2 hover:ring-violet-500/50 transition-all focus-visible:ring-2 focus-visible:ring-violet-500">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                      <AvatarFallback className="bg-violet-600 text-white text-xs font-bold">
                        {user?.name ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 bg-[#0d1224] border border-white/10 shadow-2xl p-0" align="end" forceMount>
                  {/* User info */}
                  <div className="p-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-violet-500/30">
                        <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                        <AvatarFallback className="bg-violet-600 text-white font-bold">
                          {user?.name ? getInitials(user.name) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.name || "User"}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || ""}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
                          <span className="text-xs text-green-500">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-1">
                    {[
                      { label: "Profile", sub: "Manage your account", href: "/profile", icon: User },
                      { label: "Settings", sub: "Preferences & privacy", href: "/settings", icon: Settings },
                    ].map(({ label, sub, href, icon: Icon }) => (
                      <DropdownMenuItem key={href} asChild className="rounded-lg cursor-pointer hover:bg-white/5 focus:bg-white/5 p-0">
                        <Link to={href} className="flex items-center gap-3 px-3 py-2.5 w-full">
                          <div className="w-7 h-7 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-slate-200">{label}</span>
                            <p className="text-xs text-slate-500">{sub}</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>

                  <DropdownMenuSeparator className="bg-white/[0.06] mx-2" />

                  <div className="p-1">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <LogOut className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Sign Out</span>
                        <p className="text-xs text-slate-500">See you later!</p>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile toggle */}
              <Button
                variant="ghost"
                size="sm"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setIsMobileMenuOpen((o) => !o)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <nav className="md:hidden border-t border-white/[0.06] py-3" aria-label="Mobile navigation">
              <div className="flex flex-col gap-1">
                {appNav.map(({ label, href }) => (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(href) ? "bg-violet-600/15 text-violet-400" : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                <div className="pt-2 mt-1 border-t border-white/[0.06]">
                  <Button
                    size="sm"
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
                    onClick={() => { setIsCreateBoardModalOpen(true); setIsMobileMenuOpen(false) }}
                  >
                    <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    New Board
                  </Button>
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSubmit={(taskData) => {
          if (boardId) {
            createTask({ ...taskData, board_id: boardId })
          } else {
            boardsAPI.getBoards().then((response) => {
              if (response?.data?.length > 0) {
                toast({ title: "Select a board", description: "Please open a board to create a task." })
                navigate("/boards")
              } else {
                toast({ title: "No boards found", description: "Create a board first." })
                setIsCreateBoardModalOpen(true)
              }
            }).catch(() => { navigate("/boards") })
          }
        }}
        columnId="todo"
      />

      {/* Create Board Modal */}
      <Dialog open={isCreateBoardModalOpen} onOpenChange={setIsCreateBoardModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0d1224] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white font-bold">Create New Board</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBoard} className="space-y-4 pt-2">
            <div>
              <label htmlFor="board-name" className="block text-sm font-medium text-slate-300 mb-2">Board Name</label>
              <Input
                id="board-name"
                value={newBoard.name}
                onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                placeholder="e.g. Q2 Roadmap…"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500"
              />
            </div>
            <div>
              <label htmlFor="board-description" className="block text-sm font-medium text-slate-300 mb-2">Description <span className="text-slate-600">(optional)</span></label>
              <Textarea
                id="board-description"
                value={newBoard.description}
                onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                placeholder="What's this board for?…"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500 resize-none"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="board-team" className="block text-sm font-medium text-slate-300 mb-2">Team <span className="text-slate-600">(optional)</span></label>
              <select
                id="board-team"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500"
              >
                <option value="" className="bg-[#0d1224]">No team (Personal Board)</option>
                {teamsData?.data?.map((team: any) => (
                  <option key={team.id} value={team.id} className="bg-[#0d1224]">{team.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateBoardModalOpen(false)} className="border-white/10 text-slate-300 hover:bg-white/5">
                Cancel
              </Button>
              <Button type="submit" disabled={createBoardMutation.isLoading} className="bg-violet-600 hover:bg-violet-500 text-white">
                {createBoardMutation.isLoading ? "Creating…" : "Create Board"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
