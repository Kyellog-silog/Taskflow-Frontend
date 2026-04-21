"use client"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Header } from "../components/Header"
import { CreateBoardModal } from "../components/CreateBoardModal"
import { DeleteBoardModal } from "../components/DeleteBoardModal"
import { EditBoardModal } from "../components/EditBoardModal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../components/ui/dropdown-menu"
import { boardsAPI, tasksAPI, profileAPI } from "../services/api"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "../contexts/AuthContext"
import {
  Users, CheckSquare, Clock, MoreVertical, Folder, RefreshCw, Target,
  Edit, Trash2, Copy, ExternalLink, TrendingUp, Activity, Eye, Archive,
} from "lucide-react"
import logger from "../lib/logger"

/* ── helpers ── */
const activityBadgeClass = (kind: string) =>
  kind === "completed" ? "bg-green-500/15 text-green-400 border-green-500/20"
  : kind === "created"  ? "bg-violet-500/15 text-violet-400 border-violet-500/20"
  : kind === "deleted"  ? "bg-red-500/15 text-red-400 border-red-500/20"
  : "bg-blue-500/15 text-blue-400 border-blue-500/20"

const activityDotClass = (kind: string) =>
  kind === "completed" ? "bg-green-500"
  : kind === "created"  ? "bg-violet-500"
  : kind === "deleted"  ? "bg-red-500"
  : "bg-blue-500"

const statCards = [
  { key: "boards",  label: "Total Boards",   sub: "Active projects",     icon: Folder,      color: "from-violet-500/20 to-purple-500/10", iconColor: "text-violet-400", border: "border-violet-500/20" },
  { key: "tasks",   label: "Active Tasks",   sub: "Across all boards",   icon: CheckSquare, color: "from-blue-500/20 to-cyan-500/10",     iconColor: "text-blue-400",   border: "border-blue-500/20" },
  { key: "recent",  label: "Recent Boards",  sub: "Recently visited",    icon: Clock,       color: "from-emerald-500/20 to-green-500/10", iconColor: "text-emerald-400", border: "border-emerald-500/20" },
  { key: "due",     label: "Due Today",      sub: "Need attention",      icon: Target,      color: "from-orange-500/20 to-red-500/10",    iconColor: "text-orange-400", border: "border-orange-500/20" },
]

const DashboardPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteBoard, setDeleteBoard] = useState<any>(null)
  const [editBoard, setEditBoard]     = useState<any>(null)

  /* ── queries ── */
  const { data: recentBoardsData, isLoading: recentBoardsLoading, error: recentBoardsError, refetch: refetchRecentBoards } = useQuery(
    ["boards", "recent"],
    () => boardsAPI.getBoards("recent", 5),
    { refetchOnWindowFocus: false, refetchOnMount: false, staleTime: 5 * 60 * 1000,
      onError: (e: any) => { logger.error("Failed to fetch recent boards:", e); toast({ title: "Error", description: "Failed to load recent boards", variant: "destructive" }) } },
  )
  const { data: allBoardsData } = useQuery(
    ["boards", "active"],
    () => boardsAPI.getBoards("active"),
    { refetchOnWindowFocus: false, refetchOnMount: false, staleTime: 5 * 60 * 1000 },
  )
  const { data: dueTodayData, isLoading: dueTodayLoading } = useQuery(
    ["tasks", "due-today", { uncompleted: true }],
    () => tasksAPI.getDueTodayCount(),
    { staleTime: 60 * 1000, refetchOnWindowFocus: false, refetchOnMount: false },
  )
  const { data: dueSoonData, isLoading: dueSoonLoading } = useQuery(
    ["tasks", "due-soon", { days: 3, uncompleted: true }],
    () => tasksAPI.getDueSoonCount(3),
    { staleTime: 60 * 1000, refetchOnWindowFocus: false, refetchOnMount: false },
  )
  const { data: activityResp } = useQuery(
    ["profile", "activity", { limit: 5 }],
    () => profileAPI.getActivity(5),
    { staleTime: 30_000, refetchOnMount: true, refetchOnWindowFocus: false },
  )

  /* ── derived ── */
  const recentBoards = recentBoardsData?.data || []
  const allBoards    = allBoardsData?.data   || []
  const totalTasks   = allBoards.reduce((acc: number, b: any) => acc + (b.tasks_count || 0), 0)
  const totalBoards  = allBoards.length

  const activities = (activityResp?.data || [])
    .filter((a: any) => ["created", "completed", "moved", "joined", "deleted"].includes(a.action))
    .map((a: any) => {
      const isMovedToDone = a.action === "moved" && /to\s*Done/i.test(a.description || "")
      const kind  = isMovedToDone ? "completed" : a.action
      const title = a.task?.title || a.board?.name || a.team?.name || a.description
      return { id: a.id, kind, title, boardId: a.task?.board_id || a.board?.id || null, time: new Date(a.created_at).toLocaleString() }
    })
    .slice(0, 5)

  const statValues: Record<string, any> = {
    boards: totalBoards,
    tasks:  totalTasks,
    recent: recentBoards.length,
    due:    dueTodayLoading ? "…" : (dueTodayData?.data?.count ?? 0),
  }

  const estimateCompletion = (board: any) => {
    const total = board.tasks_count || 0
    if (!total) return 0
    const doneCol = board.columns?.find((c: any) => /done|complete/i.test(c.name))
    if (doneCol?.tasks) return Math.round((doneCol.tasks.length / total) * 100)
    return Math.min(100, Math.round(total > 0 ? 25 : 0))
  }

  /* ── mutations ── */
  const deleteBoardMutation = useMutation(
    (id: string) => boardsAPI.deleteBoard(id),
    { onSuccess: () => { queryClient.invalidateQueries("boards"); toast({ title: "Board deleted" }); setDeleteBoard(null) },
      onError: (e: any) => toast({ title: "Error", description: e.response?.data?.message || "Failed to delete board", variant: "destructive" }) },
  )
  const archiveBoardMutation = useMutation(
    (id: string) => boardsAPI.archiveBoard(id),
    { onSuccess: () => { queryClient.invalidateQueries("boards"); toast({ title: "Board archived" }) },
      onError: (e: any) => toast({ title: "Error", description: e.response?.data?.message || "Failed to archive board", variant: "destructive" }) },
  )

  const handleBoardCreated = (nb: any) => {
    logger.log("Board created:", nb)
    refetchRecentBoards()
    queryClient.invalidateQueries(["boards", "active"])
    queryClient.invalidateQueries(["profile", "activity"])
    toast({ title: "Board created!" })
  }
  const handleBoardUpdated = (ub: any) => {
    logger.log("Board updated:", ub)
    refetchRecentBoards()
    queryClient.invalidateQueries(["boards", "active"])
    queryClient.invalidateQueries(["profile", "activity"])
    setEditBoard(null)
    toast({ title: "Board updated!" })
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <Header />

      <main className="container mx-auto px-4 py-8">

        {/* Page heading */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-slate-400">Here&apos;s what&apos;s happening with your projects today.</p>
          </div>
          <CreateBoardModal onBoardCreated={handleBoardCreated} />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ key, label, sub, icon: Icon, color, iconColor, border }) => (
            <Card key={key} className={`bg-gradient-to-br ${color} border ${border} shadow-lg`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
                    <p
                      className="text-3xl font-bold text-white tabular-nums"
                      aria-live={key === "due" ? "polite" : undefined}
                    >
                      {statValues[key]}
                    </p>
                    <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" aria-hidden="true" />
                      {sub}
                    </p>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl">
                    <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
                  </div>
                </div>
                {key === "due" && (
                  <p className="mt-3 text-xs text-slate-500">
                    Due in 3 days: {dueSoonLoading ? "…" : (dueSoonData?.data?.count ?? 0)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent boards */}
        <section className="mb-8" aria-labelledby="recent-boards-heading">
          <div className="flex items-center justify-between mb-5">
            <h2 id="recent-boards-heading" className="text-xl font-semibold text-white">
              Recently Visited Boards
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/boards")}
                className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-xs"
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                View All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchRecentBoards()}
                disabled={recentBoardsLoading}
                className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${recentBoardsLoading ? "animate-spin" : ""}`} aria-hidden="true" />
                {recentBoardsLoading ? "Refreshing…" : "Refresh"}
              </Button>
            </div>
          </div>

          {recentBoardsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl h-40 animate-pulse" />
              ))}
            </div>
          ) : recentBoardsError ? (
            <div className="glass rounded-2xl p-8 text-center">
              <Folder className="h-10 w-10 text-slate-600 mx-auto mb-3" aria-hidden="true" />
              <p className="text-slate-300 font-medium mb-1">Failed to load recent boards</p>
              <p className="text-slate-500 text-sm mb-4">There was an error. Please try again.</p>
              <Button size="sm" onClick={() => refetchRecentBoards()} className="bg-violet-600 hover:bg-violet-500 text-white">
                Try Again
              </Button>
            </div>
          ) : recentBoards.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Clock className="h-12 w-12 text-slate-600 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-white font-semibold text-lg mb-2">No recent boards yet</h3>
              <p className="text-slate-400 text-sm mb-6">Create your first board or visit an existing one to see it here.</p>
              <div className="flex justify-center gap-3">
                <CreateBoardModal onBoardCreated={handleBoardCreated} />
                <Button variant="outline" size="sm" onClick={() => navigate("/boards")} className="border-white/10 text-slate-300 hover:bg-white/5">
                  <Eye className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  View All Boards
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentBoards.map((board: any) => (
                <Card
                  key={board.id}
                  onClick={() => navigate(`/boards/${board.id}`)}
                  className="group glass rounded-2xl border-white/[0.06] hover:border-violet-500/30 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-violet-900/20 bg-transparent"
                >
                  <CardHeader className="pb-2 pt-5 px-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold text-white group-hover:text-violet-300 transition-colors truncate flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" aria-hidden="true" />
                          {board.name}
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-xs mt-1 line-clamp-1">
                          {board.description || "No description"}
                        </CardDescription>
                      </div>

                      {/* Board actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Actions for ${board.name}`}
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4 text-slate-400" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#0d1224] border border-white/10 shadow-2xl">
                          {[
                            { label: "Edit Board",        icon: Edit,         cls: "text-slate-300", action: (e: any) => { e.stopPropagation(); setEditBoard(board) } },
                            { label: "Archive Board",     icon: Archive,      cls: "text-orange-400", action: (e: any) => { e.stopPropagation(); archiveBoardMutation.mutate(board.id) } },
                            { label: "Duplicate Board",   icon: Copy,         cls: "text-slate-300", action: (e: any) => { e.stopPropagation(); toast({ title: "Coming soon!" }) } },
                            { label: "Open in New Tab",   icon: ExternalLink, cls: "text-slate-300", action: (e: any) => { e.stopPropagation(); window.open(`/boards/${board.id}`, "_blank") } },
                          ].map(({ label, icon: Icon, cls, action }) => (
                            <DropdownMenuItem key={label} onClick={action} className={`flex items-center gap-2 ${cls} hover:bg-white/5 cursor-pointer text-sm`}>
                              <Icon className="h-4 w-4" aria-hidden="true" />
                              {label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator className="bg-white/[0.06]" />
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); setDeleteBoard(board) }}
                            className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 cursor-pointer text-sm"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Delete Board
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 pb-5 pt-0 space-y-3">
                    {/* Stats row */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Target className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" />
                          <span className="tabular-nums font-medium text-white">{board.columns?.length || 0}</span> cols
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <CheckSquare className="h-3.5 w-3.5 text-green-400" aria-hidden="true" />
                          <span className="tabular-nums font-medium text-white">{board.tasks_count || 0}</span> tasks
                        </span>
                      </div>
                      {/* Progress */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-300"
                            style={{ width: `${estimateCompletion(board)}%` }}
                            role="progressbar"
                            aria-valuenow={estimateCompletion(board)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Board completion"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 tabular-nums">{estimateCompletion(board)}%</span>
                      </div>
                    </div>

                    {/* Team badge */}
                    {board.team?.name && (
                      <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs font-medium">
                        <Users className="h-3 w-3 mr-1" aria-hidden="true" />
                        {board.team.name}
                      </Badge>
                    )}

                    {/* Creator + last visited */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={board.created_by?.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-violet-600 text-white text-[10px] font-bold">
                            {board.created_by?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-slate-400">{board.created_by?.name || "Unknown"}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {board.last_visited_at
                          ? new Date(board.last_visited_at).toLocaleDateString() === new Date().toLocaleDateString()
                            ? "Today"
                            : `${Math.ceil((Date.now() - new Date(board.last_visited_at).getTime()) / 86400000)}d ago`
                          : "Never"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Recent activity */}
        <section aria-labelledby="activity-heading">
          <Card className="glass border-white/[0.06] bg-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-600/20 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-violet-400" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle id="activity-heading" className="text-white text-base">Recent Activity</CardTitle>
                  <CardDescription className="text-slate-500 text-xs">Latest updates from your boards</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-10">
                  <Activity className="h-10 w-10 text-slate-700 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-slate-400 text-sm">No recent activity yet</p>
                  <p className="text-slate-600 text-xs mt-1">Create your first board or task to get started.</p>
                </div>
              ) : (
                <ul className="space-y-2" aria-label="Activity feed">
                  {activities.map((a: any) => (
                    <li
                      key={a.id}
                      onClick={() => a.boardId && navigate(`/boards/${a.boardId}`)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer border border-transparent hover:border-white/[0.05]"
                    >
                      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${activityDotClass(a.kind)}`} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 truncate">{a.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{a.time}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${activityBadgeClass(a.kind)}`}>
                        {a.kind === "completed" ? "Completed" : a.kind === "created" ? "New" : a.kind === "deleted" ? "Deleted" : "Updated"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Modals */}
      {deleteBoard && (
        <DeleteBoardModal
          board={deleteBoard}
          isOpen={!!deleteBoard}
          onClose={() => setDeleteBoard(null)}
          onConfirm={() => deleteBoardMutation.mutate(deleteBoard.id)}
          isLoading={deleteBoardMutation.isLoading}
        />
      )}
      {editBoard && (
        <EditBoardModal
          board={editBoard}
          isOpen={!!editBoard}
          onClose={() => setEditBoard(null)}
          onBoardUpdated={handleBoardUpdated}
        />
      )}
    </div>
  )
}

export default DashboardPage
