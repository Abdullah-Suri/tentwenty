import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const sortBy = searchParams.get("sortBy") || "startDate";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const skip = (page - 1) * limit;

  const where: any = {
    userId: (session.user as any).id,
  };

  if (status && status !== "all") {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.AND = [];
    if (dateFrom) {
      where.AND.push({ endDate: { gte: new Date(dateFrom) } });
    }
    if (dateTo) {
      where.AND.push({ startDate: { lte: new Date(dateTo) } });
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
