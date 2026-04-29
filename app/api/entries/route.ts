import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

async function updateTimesheetStatus(timesheetId: string) {
  const entries = await prisma.entry.findMany({
    where: { timesheetId },
  });

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

  let status: "COMPLETED" | "INCOMPLETE" | "MISSING" = "MISSING";
  if (totalHours >= 40) status = "COMPLETED";
  else if (totalHours > 0) status = "INCOMPLETE";

  await prisma.timesheet.update({
    where: { id: timesheetId },
    data: { status },
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, taskDescription, hours, typeOfWork, projectId, timesheetId } = body;

    // Validation
    if (!date || !taskDescription || hours === undefined || !typeOfWork || !projectId || !timesheetId) {
      return NextResponse.json({ error: "All fields marked with * are required." }, { status: 400 });
    }

    if (isNaN(parseFloat(hours)) || parseFloat(hours) <= 0) {
      return NextResponse.json({ error: "Hours must be a number greater than 0." }, { status: 400 });
    }

    const entry = await prisma.entry.create({
      data: {
        date: new Date(date),
        taskDescription,
        hours: parseFloat(hours),
        typeOfWork,
        projectId,
        timesheetId,
      },
    });

    await updateTimesheetStatus(timesheetId);

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error creating entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, date, taskDescription, hours, typeOfWork, projectId } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing entry ID." }, { status: 400 });
    }

    // Validation
    if (!taskDescription || hours === undefined || !typeOfWork || !projectId) {
      return NextResponse.json({ error: "All fields marked with * are required." }, { status: 400 });
    }

    if (isNaN(parseFloat(hours)) || parseFloat(hours) <= 0) {
      return NextResponse.json({ error: "Hours must be a number greater than 0." }, { status: 400 });
    }

    const existingEntry = await prisma.entry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    const entry = await prisma.entry.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        taskDescription,
        hours: parseFloat(hours),
        typeOfWork,
        projectId,
      },
    });

    await updateTimesheetStatus(existingEntry.timesheetId);

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error updating entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID." }, { status: 400 });
  }

  try {
    const existingEntry = await prisma.entry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    await prisma.entry.delete({
      where: { id },
    });

    await updateTimesheetStatus(existingEntry.timesheetId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
