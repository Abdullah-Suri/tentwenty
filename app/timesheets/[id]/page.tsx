"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { EntryModal } from "@/components/timesheets/entry-modal";
import { goeyToast } from "goey-toast";

interface Entry {
  id: string;
  date: string;
  taskDescription: string;
  hours: number;
  typeOfWork: string;
  projectId: string;
  project: {
    name: string;
  };
}

interface Timesheet {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  entries: Entry[];
}

function DetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
      <div className="space-y-10 pt-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-8">
            <div className="w-20 pt-2">
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex-1 space-y-3">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TimesheetDetailPage() {
  const { id } = useParams();
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryIdToDelete, setEntryIdToDelete] = useState<string | null>(null);

  const router = useRouter();

  const fetchTimesheet = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/timesheets/${id}`);
      if (res.status === 401) return;
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTimesheet(data);
    } catch (error) {
      console.error(error);
      goeyToast.error("Failed to load timesheet", {
        description: "Please check your connection and try again.",
      });
      router.push("/");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchTimesheet();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchTimesheet]);

  const confirmDelete = async () => {
    if (!entryIdToDelete) return;
    
    try {
      const res = await fetch(`/api/entries?id=${entryIdToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        goeyToast.success("Entry deleted successfully", {
          description: "Your timesheet has been updated.",
        });
        fetchTimesheet(true);
      } else {
        goeyToast.error("Failed to delete entry", {
          description: "An error occurred while trying to remove the task.",
        });
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
      goeyToast.error("An error occurred");
    } finally {
      setDeleteDialogOpen(false);
      setEntryIdToDelete(null);
    }
  };

  const openAddModal = (date: string) => {
    setSelectedDate(date);
    setEditingEntry(null);
    setModalOpen(true);
  };

  const openEditModal = (entry: Entry) => {
    setSelectedDate(entry.date);
    setEditingEntry(entry);
    setModalOpen(true);
  };

  if (loading && !timesheet) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <Header />
        <main className="flex-1 container mx-auto px-4 pt-12">
          <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-8">
            <DetailSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!timesheet) return null;

  const totalHours = timesheet.entries.reduce((sum, entry) => sum + entry.hours, 0);
  const percent = Math.min((totalHours / 40) * 100, 100);

  const getProgressColor = (p: number) => {
    if (p >= 100) return "bg-success-text";
    if (p >= 50) return "bg-progress-50";
    return "bg-danger-text";
  };

  const groupedEntries: Record<string, Entry[]> = {};
  const start = new Date(timesheet.startDate);
  const end = new Date(timesheet.endDate);
  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
    groupedEntries[new Date(d).toDateString()] = [];
  }

  timesheet.entries.forEach((entry) => {
    const dateKey = new Date(entry.date).toDateString();
    if (groupedEntries[dateKey]) {
      groupedEntries[dateKey].push(entry);
    }
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatFullDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${e.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-12">
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-[32px] font-bold text-[#111827] dark:text-foreground">This week&apos;s timesheet</h1>
              <p className="text-muted-foreground font-medium">
                {formatFullDateRange(timesheet.startDate, timesheet.endDate)}
              </p>
            </div>

            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Progress</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{percent}%</span>
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden cursor-pointer">
                    <div 
                      className={cn("h-full transition-all duration-500", getProgressColor(percent))}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">{totalHours}/40 hrs</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="space-y-10 pt-4">
            {days.map((day) => {
              const dateKey = day.toDateString();
              const entries = groupedEntries[dateKey];

              return (
                <div key={dateKey} className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                  <div className="w-full sm:w-20 pt-2 border-b sm:border-none pb-2 sm:pb-0">
                    <span className="text-[18px] font-semibold text-[#111827] dark:text-foreground">
                      {formatDate(day)}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3">
                    {entries.map((entry) => (
                      <div 
                        key={entry.id} 
                        className="group flex items-center justify-between py-2 px-3 bg-white dark:bg-muted/20 border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="flex-1 font-medium text-[#111928] dark:text-foreground">
                          {entry.taskDescription}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-[#9CA3AF] font-medium">{entry.hours} hrs</span>
                          <Badge variant="secondary" className="rounded-md bg-[#E1EFFE] text-primary dark:bg-blue-900/30 dark:text-blue-400 border-none px-3 py-3.5 font-semibold">
                            {entry.project.name}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditModal(entry)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setEntryIdToDelete(entry.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}

                    <button 
                      onClick={() => openAddModal(day.toISOString())}
                      className={cn(
                        "w-full py-3 flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#E5E7EB] dark:border-muted text-muted-foreground hover:bg-[#EFF6FF] hover:border-primary/50 hover:text-primary transition-all",
                        entries.length === 0 && "bg-transparent"
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-sm font-medium">Add new task</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <EntryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            fetchTimesheet(true);
          }}
          timesheetId={id as string}
          date={selectedDate}
          initialData={editingEntry}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your task entry from this timesheet.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="!bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      <Footer />
    </div>
  );
}
