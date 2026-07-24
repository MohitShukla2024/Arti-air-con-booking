import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Arti Air Con database...");

  // Seed Admin User
  await prisma.user.upsert({
    where: { mobileNumber: "+91 98765 43210" },
    update: {},
    create: {
      fullName: "Nitesh Kumar Sharma",
      mobileNumber: "+91 98765 43210",
      email: "admin@artiaircon.com",
      role: "ADMIN",
      languagePref: "en",
    },
  });

  // Seed Customer User
  const customerUser = await prisma.user.upsert({
    where: { mobileNumber: "+91 99999 99999" },
    update: {},
    create: {
      fullName: "Alexander Pierce",
      mobileNumber: "+91 99999 99999",
      email: "alexander@example.com",
      role: "CUSTOMER",
      languagePref: "en",
    },
  });

  // Seed Sample Bookings
  await prisma.booking.upsert({
    where: { bookingCode: "#AAC-8829" },
    update: {},
    create: {
      bookingCode: "#AAC-8829",
      customerId: customerUser.id,
      fullName: "Alexander Pierce",
      email: "alexander@example.com",
      mobileNumber: "+91 99999 99999",
      fullAddress: "Plot 123, Sector 45",
      city: "Gurgaon",
      pincode: "122003",
      serviceType: "Full Unit Overhaul",
      acType: "Split AC",
      acBrand: "Daikin",
      preferredDateTime: new Date("2024-10-24T09:30:00Z"),
      status: "ACCEPTED",
      amount: 250.0,
    },
  });

  await prisma.booking.upsert({
    where: { bookingCode: "#ART-9012" },
    update: {},
    create: {
      bookingCode: "#ART-9012",
      fullName: "James Dalton",
      mobileNumber: "+61 412 345 678",
      fullAddress: "Street 10, Sector 21",
      city: "Gurgaon",
      pincode: "122001",
      serviceType: "Chemical Wash",
      acType: "Split AC",
      acBrand: "LG",
      preferredDateTime: new Date("2024-09-12T09:00:00Z"),
      status: "COMPLETED",
      amount: 120.0,
    },
  });

  // Seed Technician Activity
  await prisma.technicianActivity.createMany({
    data: [
      {
        technicianName: "Nitesh Kumar Sharma",
        actionDescription: "completed booking #ART-8941",
        bookingCode: "#ART-8941",
        clientName: "Robert White",
        statusBadge: "Success",
        statusColor: "green",
      },
      {
        technicianName: "Chen Wei",
        actionDescription: "is on his way to #ART-8994",
        bookingCode: "#ART-8994",
        location: "Sector 45, Gurgaon",
        statusBadge: "En Route",
        statusColor: "orange",
      },
    ],
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
