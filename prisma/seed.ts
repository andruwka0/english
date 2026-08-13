import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.course.upsert({
    where: { slug: "python" },
    update: {},
    create: { slug: "python", title: "Python", icon: "🐍" },
  });
  await prisma.course.upsert({
    where: { slug: "english" },
    update: {},
    create: { slug: "english", title: "English", icon: "🇬🇧" },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
