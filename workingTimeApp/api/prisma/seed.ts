import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";
import { PrismaClient } from "../src/generated/prisma/client";
import { Logger } from "@nestjs/common";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seeds() {
  // 権限データ
  await prisma.role.upsert({
    where: { id: 99 },
    update: {},
    create: { id: 99, roleName: "developer", roleDetail: "開発者アカウント" },
  });

  await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, roleName: "user", roleDetail: "ユーザーアカウント" },
  });

  await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, roleName: "admin", roleDetail: "管理者アカウント" },
  });

  // 開発者アカウント
  const password = process.env.SEED_ADMIN_PASSWORD;
  await prisma.employee.upsert({
    where: { loginId: "developer001" },
    update: {},
    create: {
      loginId: "developer001",
      loginPasswordHash: await argon2.hash(password ?? ""),
      name: "開発者001",
      roleId: 99,
    }
  });
};

seeds()
  .catch((e) => {
    Logger.log(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
