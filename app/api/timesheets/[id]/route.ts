import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const timesheet = await prisma.timesheet.findFirst({
      where: {
        id: resolvedParams.id,
        userId: session.user.id,
      },
      include: {
        entries: {
          include: { project: true },
          orderBy: { date: "asc" },
        },
      },
    });

    if (!timesheet) {
      return NextResponse.json({ error: "Timesheet not found" }, { status: 404 });
    }

    return NextResponse.json(timesheet);
  } catch (error) {
    console.error("Error fetching timesheet details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
