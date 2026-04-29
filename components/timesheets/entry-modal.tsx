"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Info, Minus, Plus } from "lucide-react";
import { goeyToast } from "goey-toast";

interface Project {
  id: string;
  name: string;
}

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  timesheetId: string;
  date: string;
  initialData?: {
    id: string;
    taskDescription: string;
    hours: number;
    typeOfWork: string;
    projectId: string;
  };
}

export function EntryModal({
  isOpen,
  onClose,
  onSuccess,
  timesheetId,
  date,
  initialData,
}: EntryModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [typeOfWork, setTypeOfWork] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [hours, setHours] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setProjectId(initialData.projectId);
        setTypeOfWork(initialData.typeOfWork);
        setTaskDescription(initialData.taskDescription);
        setHours(initialData.hours);
      } else {
        setProjectId("");
        setTypeOfWork("");
        setTaskDescription("");
        setHours(0);
      }
    }
  }, [initialData, isOpen]);

  const validate = () => {
    if (!projectId) {
      goeyToast.error("Project is required", { description: "Please select a project." });
      return false;
    }
    if (!typeOfWork) {
      goeyToast.error("Type of work is required", { description: "Please select a category." });
      return false;
    }
    if (!taskDescription.trim()) {
      goeyToast.error("Description is required", { description: "Please describe your task." });
      return false;
    }
    if (hours <= 0) {
      goeyToast.error("Invalid hours", { description: "Hours must be greater than zero." });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);

    const payload = {
      id: initialData?.id,
      timesheetId,
      date,
      projectId,
      typeOfWork,
      taskDescription,
      hours: hours,
    };

    try {
      const method = initialData ? "PUT" : "POST";
      const res = await fetch("/api/entries", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        goeyToast.success(initialData ? "Entry updated" : "Entry added", {
          description: initialData 
            ? "The task details have been modified." 
            : "A new task has been added to your week.",
        });
        onSuccess();
        onClose();
      } else {
        goeyToast.error(data.error || "Failed to save entry", {
          description: "Please check the form and try again.",
        });
      }
    } catch (error) {
      console.error("Failed to save entry:", error);
      goeyToast.error("Connection error", {
        description: "Could not reach the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const adjustHours = (delta: number) => {
    setHours(prev => Math.max(0, prev + delta));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[580px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b bg-white dark:bg-muted/20">
          <DialogTitle className="text-xl font-bold text-[#111928] dark:text-foreground">
            {initialData ? "Edit Entry" : "Add New Entry"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-background">
          <div className="space-y-3">
            <Label className="text-[14px] font-bold text-[#111928] dark:text-foreground flex items-center gap-1.5">
              Select Project * <Info className="h-4 w-4 text-[#9CA3AF]" />
            </Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-full rounded-lg border-[#E5E7EB] dark:border-muted text-[#6B7280]">
                <SelectValue placeholder="Project Name" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-[14px] font-bold text-[#111928] dark:text-foreground flex items-center gap-1.5">
              Type of Work * <Info className="h-4 w-4 text-[#9CA3AF]" />
            </Label>
            <Select value={typeOfWork} onValueChange={setTypeOfWork}>
              <SelectTrigger className="rounded-lg w-full border-[#E5E7EB] dark:border-muted text-[#6B7280]">
                <SelectValue placeholder="Bug fixes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Bug Fixes">Bug Fixes</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-[14px] font-bold text-[#111928] dark:text-foreground">
              Task description *
            </Label>
            <Textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Write text here ..."
              className="min-h-[140px] rounded-lg border-[#E5E7EB] dark:border-muted p-4 text-[#6B7280] focus-visible:ring-primary"
            />
            <p className="text-[12px] text-[#9CA3AF] font-medium">A note for extra info</p>
          </div>

          <div className="space-y-3">
            <Label className="text-[14px] font-bold text-[#111928] dark:text-foreground">
              Hours *
            </Label>
            <div className="flex items-center w-fit rounded-lg border border-[#E5E7EB] dark:border-muted overflow-hidden">
              <button
                type="button"
                onClick={() => adjustHours(-1)}
                className="size-9 flex items-center justify-center bg-[#F9FAFB] dark:bg-muted/10 hover:bg-muted border-r border-[#E5E7EB] dark:border-muted transition-colors"
              >
                <Minus className="h-4 w-4 text-[#111928] dark:text-foreground" />
              </button>
              <Input
                type="number"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                className="w-12 h-10 border-none text-center font-semibold text-[#111928] dark:text-foreground focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => adjustHours(1)}
                className="size-9 flex items-center justify-center bg-[#F9FAFB] dark:bg-muted/10 hover:bg-muted border-l border-[#E5E7EB] dark:border-muted transition-colors"
              >
                <Plus className="h-4 w-4 text-[#111928] dark:text-foreground" />
              </button>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t mt-8">
            <Button
              type="submit"
              className="flex-1 h-9 bg-primary hover:bg-primary-light text-white font-bold rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? "Saving..." : initialData ? "Update entry" : "Add entry"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-9 border-[#E5E7EB] dark:border-muted font-bold rounded-lg" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
