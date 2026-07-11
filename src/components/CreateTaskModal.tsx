"use client"

import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { tasksAPI } from "../services/api"
import { useToast } from "../hooks/use-toast"
import { Plus, Calendar, Sparkles, Target, Flag } from 'lucide-react'
import logger from "../lib/logger"

// Define two separate interfaces to handle different use cases
interface BaseCreateTaskModalProps {
  // Common props
  isOpen?: boolean;
  onClose?: () => void;
  columnName?: string;
  onTaskCreated?: (task: any) => void;
  triggerButton?: React.ReactNode;
}

// Props when using direct API approach
interface DirectApiProps extends BaseCreateTaskModalProps {
  boardId: string;
  columnId: string;
  onSubmit?: never; // Cannot be used with direct API approach
}

// Props when using callback approach
interface CallbackProps extends BaseCreateTaskModalProps {
  boardId?: never; // Not needed with callback
  columnId: string; // Still need column ID for UI and status
  onSubmit: (taskData: any) => void;
}

// Union type for all possible prop combinations
type CreateTaskModalProps = DirectApiProps | CallbackProps;

export function CreateTaskModal({ 
  isOpen: controlledIsOpen, 
  onClose, 
  boardId,
  columnId,
  columnName = "This Column",
  onSubmit,
  onTaskCreated,
  triggerButton
}: CreateTaskModalProps) {
  // Support both controlled and uncontrolled modes
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  
  const closeModal = () => {
    if (isControlled && onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
    assignee_id: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create task mutation for direct API approach
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      // Only used when boardId is provided
      if (boardId) {
        const payload = {
          ...taskData,
          board_id: boardId,
          column_id: columnId,
        };
  logger.log('Sending task payload:', payload);
        return await tasksAPI.createTask(payload);
      }
      throw new Error('boardId is required for direct API calls');
    },
    onSuccess: (data) => {
        if (boardId) {
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ["board", boardId] });
          queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
          queryClient.invalidateQueries({ queryKey: ["boards"] });
        }
        
        // Reset form and close modal
        resetForm();
        closeModal();
        
        // Call callback if provided
        if (onTaskCreated) {
          onTaskCreated(data.data || data);
        }
        
        // Show success toast
        toast({
          title: "Success! 🎉",
          description: "Your task has been created and is ready to go!",
        });
      },
    onError: (error: any) => {
        logger.error("Task creation error:", error);
        toast({
          title: "Oops! Something went wrong",
          description: error.response?.data?.message || error.message || "Failed to create task",
          variant: "destructive",
        });
      },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
      assignee_id: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim()) {
      toast({
        title: "Hold on! ✋",
        description: "Your task needs a title to get started",
        variant: "destructive",
      });
      return;
    }

    // Prepare task data with columnId included for status
    const taskData = {
      ...formData,
      column_id: columnId,
      status: columnId,
      columnId: columnId,
    };

  logger.log("Submitting task data:", taskData);
    
    // If using callback approach
    if (onSubmit) {
      onSubmit(taskData);
      resetForm();
      closeModal();
      return;
    }
    
    // Otherwise use direct API approach (requires boardId)
    if (boardId) {
      // Make sure both boardId and columnId are included
      createTaskMutation.mutate({
        ...taskData,
        board_id: boardId,
        column_id: columnId,
      });
    } else {
      // This should never happen due to TypeScript, but just in case
      toast({
        title: "Configuration Error",
        description: "Either boardId or onSubmit must be provided",
        variant: "destructive",
      });
    }
  };

  // Generic field change handler
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return { color: "text-red-400", bg: "bg-red-500/10", icon: "🔥" }
      case "medium":
        return { color: "text-amber-400", bg: "bg-amber-500/10", icon: "⚡" }
      case "low":
        return { color: "text-green-400", bg: "bg-green-500/10", icon: "🌱" }
      default:
        return { color: "text-slate-400", bg: "bg-white/5", icon: "📋" }
    }
  }

  const priorityConfig = getPriorityConfig(formData.priority)

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 transition-all duration-300 group">
      <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
      Add task
    </Button>
  );

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={isControlled ? onClose : setInternalIsOpen}
    >
      {!isControlled && (
        <DialogTrigger asChild>
          {triggerButton || defaultTrigger}
        </DialogTrigger>
      )}
      
      <DialogContent className="bg-[#0d1224] border border-white/10 max-w-md shadow-2xl text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <span>Create New Task {columnName && `in ${columnName}`}</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-300 mb-3 block flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span>Task Title *</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="What needs to be done?"
              required
              className="bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-slate-300 mb-3 block">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Add some details to help your team understand the task..."
              rows={3}
              className="bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all duration-200"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-3 block flex items-center space-x-2">
                <Flag className="h-4 w-4 text-purple-500" />
                <span>Priority</span>
              </label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger className={`bg-white/5 border border-white/10 text-white focus:border-violet-500 ${priorityConfig.bg}`}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1224] border border-white/10 text-white">
                  <SelectItem value="low" className="text-slate-200 hover:bg-white/5 focus:bg-white/5 focus:text-white">
                    <div className="flex items-center space-x-2">
                      <span>🌱</span>
                      <span>Low Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium" className="text-slate-200 hover:bg-white/5 focus:bg-white/5 focus:text-white">
                    <div className="flex items-center space-x-2">
                      <span>⚡</span>
                      <span>Medium Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high" className="text-slate-200 hover:bg-white/5 focus:bg-white/5 focus:text-white">
                    <div className="flex items-center space-x-2">
                      <span>🔥</span>
                      <span>High Priority</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-3 block flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <span>Due Date</span>
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleChange("due_date", e.target.value)}
                  className="bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all duration-200"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-white/[0.06]">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="bg-transparent border border-white/15 text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {createTaskMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Magic...
                </div>
              ) : (
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Task
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
