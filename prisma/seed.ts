import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Arti Air Con database...");

  // Seed Admin User
  await prisma.user.upsert({
    where: { mobileNumber: "+91 98765 43210" },
    update: {
      passwordHash: "874e3ee66f7dadea79789690d30a97eb:f6715dd185e5a86fdd6c68b2826e3765d45223d23e8a602fb947fff448ce9061d9e1d7fb051a5500c53700a80c77ecb3e07ef6c985af90717e5cda08cf304e67",
    },
    create: {
      fullName: "Nitesh Kumar Sharma",
      mobileNumber: "+91 98765 43210",
      email: "admin@artiair.com",
      role: "ADMIN",
      passwordHash: "874e3ee66f7dadea79789690d30a97eb:f6715dd185e5a86fdd6c68b2826e3765d45223d23e8a602fb947fff448ce9061d9e1d7fb051a5500c53700a80c77ecb3e07ef6c985af90717e5cda08cf304e67",
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

  console.log("Database seeded successfully (clean state - no sample bookings).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
