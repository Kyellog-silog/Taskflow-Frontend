"use client"

import type React from "react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { boardsAPI } from "../services/api"
import { useToast } from "../hooks/use-toast"
import { Plus, Sparkles, Target, X } from 'lucide-react'

interface CreateBoardModalProps {
  onBoardCreated?: (board: any) => void
}

export function CreateBoardModal({ onBoardCreated }: CreateBoardModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createBoardMutation = useMutation({
    mutationFn: async (boardData: any) => {
      const response = await boardsAPI.createBoard(boardData)
      return response
    },
    onSuccess: (data) => {
        // Invalidate and refetch boards list
        queryClient.invalidateQueries({ queryKey: ["boards"] })

        // Optionally, update the cache directly for immediate UI update
        queryClient.setQueryData(["boards"], (oldData: any) => {
          if (oldData?.data) {
            return {
              ...oldData,
              data: [data.data, ...oldData.data],
            }
          }
          return { data: [data.data] }
        })

        // Reset form and close modal
        setFormData({ name: "", description: "" })
        setIsOpen(false)

        // Call callback if provided
        onBoardCreated?.(data.data)

        toast({
          title: "Success! 🎉",
          description: "Board created successfully!",
        })
      },
    onError: (error: any) => {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to create board",
          variant: "destructive",
        })
      },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast({
        title: "Hold on! ✋",
        description: "Your board needs a name to get started",
        variant: "destructive",
      })
      return
    }

    createBoardMutation.mutate(formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Create Board
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-[#0d1224] border border-white/10 shadow-2xl text-white">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Create New Board</DialogTitle>
              <p className="text-sm text-slate-400 mt-1">Start organizing your tasks with style</p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-slate-300 mb-3 block flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span>Board Name *</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter board name"
              required
              className="bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="text-sm font-bold text-slate-300 mb-3 block">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter board description (optional)"
              rows={3}
              className="bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all duration-200"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-white/[0.06]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={createBoardMutation.isPending}
              className="bg-transparent border border-white/15 text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBoardMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {createBoardMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Magic...
                </div>
              ) : (
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Board
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
