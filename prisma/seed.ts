import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Create Default User
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@tentwenty.com" },
    update: {},
    create: {
      email: "admin@tentwenty.com",
      password: hashedPassword,
      name: "John Doe",
    },
  });

  console.log({ user });

  // 2. Create Projects
  const projectNames = ["Homepage Development", "Mobile App UI", "Backend API", "Testing & QA"];
  const projects = [];
  for (const name of projectNames) {
    const project = await prisma.project.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    projects.push(project);
  }

  console.log(`Created ${projects.length} projects`);

  // 3. Create Sample Timesheets and Entries
  // Let's create data for the last 5 weeks
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() - (i * 7)); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
    weekEnd.setHours(23, 59, 59, 999);

    const weekNumber = 17 - i; // Arbitrary week numbers for demo

    // Create Timesheet
    const timesheet = await prisma.timesheet.upsert({
      where: {
        userId_weekNumber_startDate: {
          userId: user.id,
          weekNumber,
          startDate: weekStart,
        },
      },
      update: {},
      create: {
        userId: user.id,
        weekNumber,
        startDate: weekStart,
        endDate: weekEnd,
        status: i === 0 ? "INCOMPLETE" : "COMPLETED", // Make the latest one incomplete
      },
    });

    // Create some entries for the timesheet
    if (i !== 4) { // Let one week be MISSING (no entries)
      const numEntries = i === 0 ? 5 : 10; // Fewer entries for the incomplete one
      for (let j = 0; j < numEntries; j++) {
        const entryDate = new Date(weekStart);
        entryDate.setDate(weekStart.getDate() + (j % 7));

        await prisma.entry.create({
          data: {
            date: entryDate,
            taskDescription: `Task ${j + 1} for week ${weekNumber}`,
            hours: i === 0 ? 4 : 4, // 4 hours per entry
            typeOfWork: j % 2 === 0 ? "Development" : "Design",
            projectId: projects[j % projects.length].id,
            timesheetId: timesheet.id,
          },
        });
      }

      // Update timesheet status based on total hours
      const totalHours = (i === 0 ? 5 : 10) * 4;
      let status: "COMPLETED" | "INCOMPLETE" | "MISSING" = "MISSING";
      if (totalHours >= 40) status = "COMPLETED";
      else if (totalHours > 0) status = "INCOMPLETE";

      await prisma.timesheet.update({
        where: { id: timesheet.id },
        data: { status },
      });
    } else {
        // Week 4 is MISSING (no entries)
        await prisma.timesheet.update({
            where: { id: timesheet.id },
            data: { status: "MISSING" }
        });
    }
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
