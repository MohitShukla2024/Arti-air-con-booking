import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing all existing bookings, notifications, and technician activities...");

  try {
    const deletedActivities = await prisma.technicianActivity.deleteMany({});
    console.log(`Deleted ${deletedActivities.count} technician activities.`);

    const deletedNotifications = await prisma.notification.deleteMany({});
    console.log(`Deleted ${deletedNotifications.count} notifications.`);

    const deletedBookings = await prisma.booking.deleteMany({});
    console.log(`Deleted ${deletedBookings.count} bookings.`);

    console.log("Database cleared! Admin dashboard is now clean and ready for new orders.");
  } catch (error) {
    console.error("Error clearing database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
