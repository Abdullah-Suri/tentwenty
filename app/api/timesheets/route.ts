import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");
  const statusFilter = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const sortBy = searchParams.get("sortBy") || "startDate";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const skip = (page - 1) * limit;

  const where: Prisma.TimesheetWhereInput = {
    userId: session.user.id,
  };

  if (statusFilter && statusFilter !== "all") {
    where.status = statusFilter as "COMPLETED" | "INCOMPLETE" | "MISSING";
  }

  if (dateFrom || dateTo) {
    where.AND = [];
    if (dateFrom) {
      (where.AND as Prisma.TimesheetWhereInput[]).push({ endDate: { gte: new Date(dateFrom) } });
    }
    if (dateTo) {
      (where.AND as Prisma.TimesheetWhereInput[]).push({ startDate: { lte: new Date(dateTo) } });
    }
  }

  try {
    const [timesheets, total] = await Promise.all([
      prisma.timesheet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { entries: true },
          },
        },
      }),
      prisma.timesheet.count({ where }),
    ]);

    return NextResponse.json({
      timesheets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
