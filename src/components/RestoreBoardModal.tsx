"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { ArchiveRestore, X } from 'lucide-react'

interface RestoreBoardModalProps {
  board: any
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

export function RestoreBoardModal({ board, isOpen, onClose, onConfirm, isLoading }: RestoreBoardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0d1224] border border-green-500/25 shadow-2xl text-white">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <ArchiveRestore className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Restore Board</DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                Bring this board back to active status
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-sm text-slate-300 mb-2">
              Are you sure you want to restore <span className="font-bold text-green-600">"{board?.name}"</span>?
            </p>
            <p className="text-xs text-slate-400">
              This will move the board back to your active boards and make it accessible to all team members.
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <ArchiveRestore className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-300">Restore Action</p>
                <p className="text-xs text-blue-300/90 mt-1">
                  The board will be fully functional and visible in your active boards list.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="bg-transparent border border-white/15 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Restoring...
                </div>
              ) : (
                <div className="flex items-center">
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Restore Board
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
