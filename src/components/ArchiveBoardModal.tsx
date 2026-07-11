"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Archive, X } from 'lucide-react'

interface ArchiveBoardModalProps {
  board: any
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

export function ArchiveBoardModal({ board, isOpen, onClose, onConfirm, isLoading }: ArchiveBoardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0d1224] border border-orange-500/25 shadow-2xl text-white">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl">
              <Archive className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Archive Board</DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                Move this board to archived status
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <p className="text-sm text-slate-300 mb-2">
              Are you sure you want to archive <span className="font-bold text-orange-600">"{board?.name}"</span>?
            </p>
            <p className="text-xs text-slate-400">
              This will move the board to your archived boards. You can unarchive it later if needed.
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Archive className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-300">Archive Benefits</p>
                <p className="text-xs text-blue-300/90 mt-1">
                  Archived boards are hidden from your main view but remain accessible and can be restored anytime.
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
              className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Archiving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Board
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
