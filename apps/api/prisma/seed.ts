import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.warn("🌱 Seeding database...");
  // Add any seed data here if needed
  console.warn("✅ Database seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
