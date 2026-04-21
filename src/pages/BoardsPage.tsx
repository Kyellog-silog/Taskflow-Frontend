"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { useNavigate } from "react-router-dom"
import { Header } from "../components/Header"
import { CreateBoardModal } from "../components/CreateBoardModal"
import { DeleteBoardModal } from "../components/DeleteBoardModal"
import { EditBoardModal } from "../components/EditBoardModal"
import { RestoreBoardModal } from "../components/RestoreBoardModal"
import { ArchiveBoardModal } from "../components/ArchiveBoardModal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../components/ui/dropdown-menu"
import { boardsAPI } from "../services/api"
import { useToast } from "../hooks/use-toast"
import {
  Calendar, Users, CheckSquare, MoreVertical, Folder, RefreshCw,
  Target, Edit, Trash2, Copy, ExternalLink, Archive, ArchiveRestore, Eye, ArrowLeft,
} from "lucide-react"

const BoardsPage = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab]     = useState("active")
  const [deleteBoard, setDeleteBoard] = useState<any>(null)
  const [editBoard, setEditBoard]     = useState<any>(null)
  const [restoreBoard, setRestoreBoard] = useState<any>(null)
  const [archiveBoard, setArchiveBoard] = useState<any>(null)

  /* ── queries ── */
  const { data: activeBoardsData,  isLoading: activeBoardsLoading,  error: activeBoardsError,  refetch: refetchActiveBoards }  = useQuery(
    ["boards", "active"],   () => boardsAPI.getBoards("active"),
    { refetchOnWindowFocus: false, refetchOnMount: false, staleTime: 5 * 60 * 1000 },
  )
  const { data: archivedBoardsData, isLoading: archivedBoardsLoading, error: archivedBoardsError, refetch: refetchArchivedBoards } = useQuery(
    ["boards", "archived"], () => boardsAPI.getBoards("archived"),
    { enabled: activeTab === "archived", refetchOnWindowFocus: false, refetchOnMount: false, staleTime: 5 * 60 * 1000 },
  )
  const { data: deletedBoardsData,  isLoading: deletedBoardsLoading,  error: deletedBoardsError,  refetch: refetchDeletedBoards }  = useQuery(
    ["boards", "deleted"],  () => boardsAPI.getBoards("deleted"),
    { enabled: activeTab === "deleted", refetchOnWindowFocus: false, refetchOnMount: false, staleTime: 5 * 60 * 1000 },
  )

  /* ── mutations ── */
  const deleteBoardMutation = useMutation((id: string) => boardsAPI.deleteBoard(id), {
    onSuccess: () => { queryClient.invalidateQueries("boards"); toast({ title: "Board deleted" }); setDeleteBoard(null) },
    onError:   (e: any) => toast({ title: "Error", description: e.response?.data?.message || "Failed to delete board", variant: "destructive" }),
  })
  const archiveBoardMutation = useMutation((id: string) => boardsAPI.archiveBoard(id), {
    onSuccess: () => { queryClient.invalidateQueries("boards"); toast({ title: "Board archived" }); setArchiveBoard(null) },
    onError:   (e: any) => toast({ title: "Error", description: e.response?.data?.message || "Failed to archive board", variant: "destructive" }),
  })
  const unarchiveBoardMutation = useMutation((id: string) => boardsAPI.unarchiveBoard(id), {
    onSuccess: () => { queryClient.invalidateQueries("boards"); toast({ title: "Board unarchived" }) },
    onError:   (e: any) => toast({ title: "Error", description: e.response?.data?.message || "Failed to unarchive board", variant: "destructive" }),
  })
  const restoreBoardMutation = useMutation((id: string) => boardsAPI.restoreBoard(id), {
    onSuccess: () => { queryClient.invalidateQueries("boards"); toast({ title: "Board restored" }); setRestoreBoard(null) },
    onError:   (e: any) => toast({ title: "Error", description: e.response?.data?.message || "Failed to restore board", variant: "destructive" }),
  })

  /* ── helpers ── */
  const getCurrentBoards  = () => activeTab === "active" ? activeBoardsData?.data || [] : activeTab === "archived" ? archivedBoardsData?.data || [] : deletedBoardsData?.data || []
  const getCurrentLoading = () => activeTab === "active" ? activeBoardsLoading : activeTab === "archived" ? archivedBoardsLoading : deletedBoardsLoading
  const getCurrentError   = () => activeTab === "active" ? activeBoardsError  : activeTab === "archived" ? archivedBoardsError  : deletedBoardsError
  const handleRefresh     = () => activeTab === "active" ? refetchActiveBoards() : activeTab === "archived" ? refetchArchivedBoards() : refetchDeletedBoards()

  const currentBoards  = getCurrentBoards()
  const currentLoading = getCurrentLoading()
  const currentError   = getCurrentError()

  const handleBoardCreated = () => { queryClient.invalidateQueries("boards"); toast({ title: "Board created!" }) }
  const handleBoardUpdated = () => { queryClient.invalidateQueries("boards"); setEditBoard(null); toast({ title: "Board updated!" }) }

  /* ── Board card ── */
  const BoardCard = ({ board, type }: { board: any; type: "active" | "archived" | "deleted" }) => (
    <Card
      onClick={() => type === "active" ? navigate(`/boards/${board.id}`) : undefined}
      className={`group glass border-white/[0.06] hover:border-violet-500/30 transition-all duration-200 bg-transparent relative overflow-hidden ${type === "active" ? "cursor-pointer hover:shadow-lg hover:shadow-violet-900/20" : ""}`}
    >
      {/* Status badge */}
      {type === "archived" && (
        <div className="absolute top-3 right-3 z-20">
          <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/20 text-xs">
            <Archive className="h-3 w-3 mr-1" aria-hidden="true" />Archived
          </Badge>
        </div>
      )}
      {type === "deleted" && (
        <div className="absolute top-3 right-3 z-20">
          <Badge className="bg-red-500/15 text-red-400 border-red-500/20 text-xs">
            <Trash2 className="h-3 w-3 mr-1" aria-hidden="true" />Deleted
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2 pt-5 px-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 pr-8">
            <CardTitle className="text-base font-semibold text-white group-hover:text-violet-300 transition-colors truncate flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${type === "active" ? "bg-violet-500" : type === "archived" ? "bg-orange-500" : "bg-red-500"}`} aria-hidden="true" />
              {board.name}
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs mt-1 line-clamp-1">
              {board.description || "No description"}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost" size="sm"
                aria-label={`Actions for ${board.name}`}
                className="absolute top-4 right-4 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#0d1224] border border-white/10 shadow-2xl">
              {type === "active" && <>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditBoard(board) }}           className="text-slate-300 hover:bg-white/5 cursor-pointer gap-2"><Edit className="h-4 w-4" aria-hidden="true" />Edit Board</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setArchiveBoard(board) }}         className="text-orange-400 hover:bg-orange-500/10 cursor-pointer gap-2"><Archive className="h-4 w-4" aria-hidden="true" />Archive Board</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: "Coming soon!" }) }} className="text-slate-300 hover:bg-white/5 cursor-pointer gap-2"><Copy className="h-4 w-4" aria-hidden="true" />Duplicate</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/boards/${board.id}`, "_blank") }} className="text-slate-300 hover:bg-white/5 cursor-pointer gap-2"><ExternalLink className="h-4 w-4" aria-hidden="true" />Open in New Tab</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/[0.06]" />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteBoard(board) }}         className="text-red-400 hover:bg-red-500/10 cursor-pointer gap-2"><Trash2 className="h-4 w-4" aria-hidden="true" />Delete Board</DropdownMenuItem>
              </>}
              {type === "archived" && <>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); unarchiveBoardMutation.mutate(board.id) }} className="text-green-400 hover:bg-green-500/10 cursor-pointer gap-2"><ArchiveRestore className="h-4 w-4" aria-hidden="true" />Unarchive</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/boards/${board.id}`, "_blank") }} className="text-slate-300 hover:bg-white/5 cursor-pointer gap-2"><Eye className="h-4 w-4" aria-hidden="true" />View Board</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/[0.06]" />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteBoard(board) }}         className="text-red-400 hover:bg-red-500/10 cursor-pointer gap-2"><Trash2 className="h-4 w-4" aria-hidden="true" />Delete Permanently</DropdownMenuItem>
              </>}
              {type === "deleted" && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRestoreBoard(board) }} className="text-green-400 hover:bg-green-500/10 cursor-pointer gap-2"><ArchiveRestore className="h-4 w-4" aria-hidden="true" />Restore Board</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-0 space-y-3">
        {/* Stats */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1">
              <Target className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" />
              <span className="tabular-nums font-medium text-white">{board.columns?.length || 0}</span> cols
            </span>
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3.5 w-3.5 text-green-400" aria-hidden="true" />
              <span className="tabular-nums font-medium text-white">{board.tasks_count || 0}</span> tasks
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
                style={{ width: `${Math.min(100, (board.tasks_count || 0) * 10)}%` }}
                role="progressbar"
                aria-valuenow={Math.min(100, (board.tasks_count || 0) * 10)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="text-[10px] text-slate-500 tabular-nums">{Math.min(100, (board.tasks_count || 0) * 10)}%</span>
          </div>
        </div>

        {/* Team badge */}
        {board.team?.name && (
          <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs">
            <Users className="h-3 w-3 mr-1" aria-hidden="true" />{board.team.name}
          </Badge>
        )}

        {/* Creator + date */}
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
            <Calendar className="h-3 w-3" aria-hidden="true" />
            {type === "archived" && board.archived_at ? new Date(board.archived_at).toLocaleDateString()
              : type === "deleted" && board.deleted_at ? new Date(board.deleted_at).toLocaleDateString()
              : new Date(board.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )

  /* ── Board grid with loading / error / empty states ── */
  const BoardGrid = ({ type }: { type: "active" | "archived" | "deleted" }) => {
    if (currentLoading) return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map((i) => <div key={i} className="glass rounded-2xl h-40 animate-pulse" />)}
      </div>
    )
    if (currentError) return (
      <div className="glass rounded-2xl p-8 text-center">
        <Folder className="h-10 w-10 text-slate-600 mx-auto mb-3" aria-hidden="true" />
        <p className="text-slate-300 font-medium mb-1">Failed to load boards</p>
        <p className="text-slate-500 text-sm mb-4">There was an error. Please try again.</p>
        <Button size="sm" onClick={handleRefresh} className="bg-violet-600 hover:bg-violet-500 text-white">Try Again</Button>
      </div>
    )
    if (currentBoards.length === 0) {
      const empties = {
        active:   { icon: Folder,  msg: "No active boards yet",      sub: "Create your first board to get started." },
        archived: { icon: Archive, msg: "No archived boards",         sub: "Boards you archive will appear here." },
        deleted:  { icon: Trash2,  msg: "No deleted boards",          sub: "Deleted boards can be restored within 30 days." },
      }
      const { icon: Icon, msg, sub } = empties[type]
      return (
        <div className="glass rounded-2xl p-12 text-center">
          <Icon className="h-12 w-12 text-slate-600 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-white font-semibold text-lg mb-2">{msg}</h3>
          <p className="text-slate-400 text-sm mb-6">{sub}</p>
          {type === "active" && <CreateBoardModal onBoardCreated={handleBoardCreated} />}
        </div>
      )
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentBoards.map((board: any) => <BoardCard key={board.id} board={board} type={type} />)}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page heading */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline" size="sm"
              onClick={() => navigate("/dashboard")}
              className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">All Boards</h1>
              <p className="text-slate-400 text-sm">Manage all your boards in one place.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              onClick={handleRefresh}
              disabled={currentLoading}
              className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${currentLoading ? "animate-spin" : ""}`} aria-hidden="true" />
              {currentLoading ? "Refreshing…" : "Refresh"}
            </Button>
            <CreateBoardModal onBoardCreated={handleBoardCreated} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/[0.04] border border-white/10 rounded-xl p-1 mb-6 inline-flex">
            <TabsTrigger value="active"   className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-400 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors">
              <Folder className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Active <span className="ml-1.5 text-[11px] tabular-nums opacity-70">({activeBoardsData?.data?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="archived" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-400 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors">
              <Archive className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Archived <span className="ml-1.5 text-[11px] tabular-nums opacity-70">({archivedBoardsData?.data?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="deleted"  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-400 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors">
              <Trash2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Deleted <span className="ml-1.5 text-[11px] tabular-nums opacity-70">({deletedBoardsData?.data?.length || 0})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active"><BoardGrid type="active" /></TabsContent>
          <TabsContent value="archived"><BoardGrid type="archived" /></TabsContent>
          <TabsContent value="deleted"><BoardGrid type="deleted" /></TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      {deleteBoard  && <DeleteBoardModal  board={deleteBoard}  isOpen={!!deleteBoard}  onClose={() => setDeleteBoard(null)}  onConfirm={() => deleteBoardMutation.mutate(deleteBoard.id)}   isLoading={deleteBoardMutation.isLoading} />}
      {editBoard    && <EditBoardModal    board={editBoard}    isOpen={!!editBoard}    onClose={() => setEditBoard(null)}    onBoardUpdated={handleBoardUpdated} />}
      {restoreBoard && <RestoreBoardModal board={restoreBoard} isOpen={!!restoreBoard} onClose={() => setRestoreBoard(null)} onConfirm={() => restoreBoardMutation.mutate(restoreBoard.id)} isLoading={restoreBoardMutation.isLoading} />}
      {archiveBoard && <ArchiveBoardModal board={archiveBoard} isOpen={!!archiveBoard} onClose={() => setArchiveBoard(null)} onConfirm={() => archiveBoardMutation.mutate(archiveBoard.id)} isLoading={archiveBoardMutation.isLoading} />}
    </div>
  )
}

export default BoardsPage
