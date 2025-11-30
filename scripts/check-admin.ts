import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAdmin() {
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@jobportal.com" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isAdmin: true,
      accountStatus: true,
    },
  });

  console.log("Admin User Check:");
  console.log(JSON.stringify(adminUser, null, 2));

  if (!adminUser) {
    console.log("\n❌ Admin user not found!");
    console.log("Run: npx prisma db seed");
  } else if (!adminUser.isAdmin) {
    console.log("\n❌ User exists but isAdmin is false!");
    console.log("Fixing...");

    await prisma.user.update({
      where: { email: "admin@jobportal.com" },
      data: { isAdmin: true },
    });

    console.log("✅ Fixed! isAdmin is now true");
  } else {
    console.log("\n✅ Admin user is correctly configured");
  }

  await prisma.$disconnect();
}

checkAdmin();
