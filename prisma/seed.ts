import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up database...");
  await prisma.entry.deleteMany({});
  await prisma.timesheet.deleteMany({});
  // Keep users and projects to avoid breaking relations

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

  console.log(`Ensured ${projects.length} projects exist`);

  // 3. Create Sample Timesheets and Entries
  // Let's create data for the last 20 weeks to test pagination
  const today = new Date();
  
  for (let i = 0; i < 20; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() - (i * 7)); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
    weekEnd.setHours(23, 59, 59, 999);

    const weekNumber = 52 - i; // Using actual week numbers descending

    // Create Timesheet
    const timesheet = await prisma.timesheet.create({
      data: {
        userId: user.id,
        weekNumber,
        startDate: weekStart,
        endDate: weekEnd,
        status: "MISSING", // Default
      },
    });

    // Randomize status for variety
    const randomStatus = i === 0 ? "INCOMPLETE" : i % 3 === 0 ? "MISSING" : i % 4 === 0 ? "INCOMPLETE" : "COMPLETED";

    if (randomStatus !== "MISSING") {
      const numEntries = randomStatus === "INCOMPLETE" ? 4 : 10;
      for (let j = 0; j < numEntries; j++) {
        const entryDate = new Date(weekStart);
        entryDate.setDate(weekStart.getDate() + (j % 7));

        await prisma.entry.create({
          data: {
            date: entryDate,
            taskDescription: `Task ${j + 1} for week ${weekNumber}`,
            hours: 4, // 4 hours per entry
            typeOfWork: j % 2 === 0 ? "Development" : "Design",
            projectId: projects[j % projects.length].id,
            timesheetId: timesheet.id,
          },
        });
      }

      // Update actual status based on hours
      const totalHours = numEntries * 4;
      let finalStatus: "COMPLETED" | "INCOMPLETE" | "MISSING" = "MISSING";
      if (totalHours >= 40) finalStatus = "COMPLETED";
      else if (totalHours > 0) finalStatus = "INCOMPLETE";

      await prisma.timesheet.update({
        where: { id: timesheet.id },
        data: { status: finalStatus },
      });
    }
  }

  console.log("Seed data for 20 weeks created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
