"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Timesheet {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: "COMPLETED" | "INCOMPLETE" | "MISSING";
}

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell className="py-6 pl-8">
            <Skeleton className="h-5 w-8" />
          </TableCell>
          <TableCell className="py-6">
            <Skeleton className="h-5 w-48" />
          </TableCell>
          <TableCell className="py-6">
            <div className="flex justify-center">
              <Skeleton className="h-7 w-24 rounded-sm" />
            </div>
          </TableCell>
          <TableCell className="py-6 pr-8">
            <div className="flex justify-end">
              <Skeleton className="h-5 w-12" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function DashboardPage() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [limit, setLimit] = useState(5);
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/timesheets", window.location.origin);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", limit.toString());
      url.searchParams.append("sortBy", sortBy);
      url.searchParams.append("sortOrder", sortOrder);

      if (statusFilter !== "all") {
        url.searchParams.append("status", statusFilter);
      }

      if (date?.from) {
        url.searchParams.append("dateFrom", date.from.toISOString());
        if (date.to) {
          url.searchParams.append("dateTo", date.to.toISOString());
        }
      }

      const res = await fetch(url.toString());
      if (res.status === 401) return;
      const data = await res.json();
      setTimesheets(data.timesheets);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch timesheets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, [page, statusFilter, limit, date, sortBy, sortOrder]);

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-GB', { day: 'numeric' })} - ${endDate.toLocaleDateString('en-GB', { day: 'numeric' })} ${endDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-success-bg text-success-text hover:bg-success-bg border-none rounded-sm px-3 py-2.5 font-bold">COMPLETED</Badge>;
      case "INCOMPLETE":
        return <Badge className="bg-warning-bg text-warning-text hover:bg-warning-bg border-none rounded-sm px-3 py-2.5 font-bold">INCOMPLETE</Badge>;
      case "MISSING":
        return <Badge className="bg-danger-bg text-danger-text hover:bg-danger-bg border-none rounded-sm px-3 py-2.5 font-bold">MISSING</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const getPaginationRange = () => {
    const range = [];
    const delta = 2;
    const left = page - delta;
    const right = page + delta + 1;
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        range.push(i);
      }
    }

    const rangeWithDots = [];
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />

      <main className="flex-1 container mx-auto px-4 pt-10">
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
          <div className="p-8 space-y-8">
            <h2 className="text-[24px] font-bold text-[#111827] dark:text-foreground">Your Timesheets</h2>

            <div className="flex flex-wrap gap-4 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[180px] justify-between text-left font-normal rounded-lg border-[#E5E7EB] dark:border-muted",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date?.from ? format(date.from, "LLL dd, y") : "Date Range"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={(newDate) => { setDate(newDate); setPage(1); }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                <SelectTrigger className="w-[180px] rounded-lg border-[#E5E7EB] dark:border-muted">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="INCOMPLETE">Incomplete</SelectItem>
                  <SelectItem value="MISSING">Missing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-[#E5E7EB] dark:border-muted overflow-x-auto">
              <Table className="min-w-[600px] lg:min-w-full">
                <TableHeader className="bg-white dark:bg-muted/10 border-b">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead
                      className="cursor-pointer text-[12px] font-bold uppercase tracking-wider text-[#6B7280] py-4"
                      onClick={() => toggleSort("weekNumber")}
                    >
                      <div className="flex items-center gap-2">
                        WEEK # <ArrowDown className={cn("h-3 w-3 transition-transform", sortBy === "weekNumber" && sortOrder === "asc" && "rotate-180")} />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-[12px] font-bold uppercase tracking-wider text-[#6B7280] py-4"
                      onClick={() => toggleSort("startDate")}
                    >
                      <div className="flex items-center gap-2">
                        DATE <ArrowDown className={cn("h-3 w-3 transition-transform", sortBy === "startDate" && sortOrder === "asc" && "rotate-180")} />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-[12px] font-bold uppercase tracking-wider text-[#6B7280] py-4"
                      onClick={() => toggleSort("status")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        STATUS <ArrowDown className={cn("h-3 w-3 transition-transform", sortBy === "status" && sortOrder === "asc" && "rotate-180")} />
                      </div>
                    </TableHead>
                    <TableHead className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] py-4 text-right pr-8">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableSkeleton />
                  ) : timesheets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                        No timesheets found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    timesheets.map((ts) => (
                      <TableRow key={ts.id} className="hover:bg-muted/30 border-b last:border-0">
                        <TableCell className="py-6 pl-8 font-medium text-[#111827] dark:text-foreground">{ts.weekNumber}</TableCell>
                        <TableCell className="py-6 text-[#4B5563] dark:text-muted-foreground">{formatDateRange(ts.startDate, ts.endDate)}</TableCell>
                        <TableCell className="py-6 text-center">{getStatusBadge(ts.status)}</TableCell>
                        <TableCell className="py-6 text-right pr-8">
                          <Link
                            href={`/timesheets/${ts.id}`}
                            className="text-primary font-medium hover:underline"
                          >
                            {ts.status === "MISSING" ? "Create" : ts.status === "INCOMPLETE" ? "Update" : "View"}
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2">
                <Select value={limit.toString()} onValueChange={(val) => { setLimit(parseInt(val)); setPage(1); }}>
                  <SelectTrigger className="w-[140px] h-11 rounded-lg border-[#E5E7EB] dark:border-muted">
                    <SelectValue placeholder="5 per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center rounded-xl border border-[#E5E7EB] dark:border-muted overflow-hidden shadow-sm">
                <button
                  className="h-10 px-4 text-sm font-medium border-r bg-white dark:bg-muted/10 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                {getPaginationRange().map((item, i) => (
                  <button
                    key={i}
                    disabled={item === "..."}
                    onClick={() => typeof item === "number" && setPage(item)}
                    className={cn(
                      "h-10 w-10 text-sm font-medium border-r bg-white dark:bg-muted/10 transition-colors",
                      item === page ? "bg-muted/50 text-primary" : "hover:bg-muted",
                      item === "..." && "cursor-default text-muted-foreground"
                    )}
                  >
                    {item}
                  </button>
                ))}
                <button
                  className="h-10 px-4 text-sm font-medium bg-white dark:bg-muted/10 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
