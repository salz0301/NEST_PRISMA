import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Ejecutando seed...");

  // Limpiar datos existentes
  await prisma.postCategory.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Crear Tenant
  const tenant = await prisma.tenant.create({
    data: {},
  });

  // Crear contraseña cifrada
  const password = await bcrypt.hash("123456", 10);

  // Crear usuarios
  const user1 = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Administrador",
      password,
      telephone: "88888888",
      role: "ADMIN",
      tenantId: tenant.id,
      profile: {
        create: {},
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "user@example.com",
      name: "Usuario Demo",
      password,
      telephone: "87777777",
      role: "USER",
      tenantId: tenant.id,
      profile: {
        create: {},
      },
    },
  });

  // Crear categorías
  const category1 = await prisma.category.create({
    data: {
      name: "Tecnología",
    },
  });

  const category2 = await prisma.category.create({
    data: {
      name: "Programación",
    },
  });

  // Crear posts
 const post1 = await prisma.post.create({
  data: {
    name: "Introducción a la tecnología",
  },
});

const post2 = await prisma.post.create({
  data: {
    name: "Aprendiendo programación",
  },
});

  // Relacionar posts con categorías
  await prisma.postCategory.create({
    data: {
      postID: post1.id,
      categoryId: category1.id,
    },
  });

  await prisma.postCategory.create({
    data: {
      postID: post1.id,
      categoryId: category2.id,
    },
  });

  await prisma.postCategory.create({
    data: {
      postID: post2.id,
      categoryId: category2.id,
    },
  });

  console.log("Seed ejecutado correctamente.");
  console.log(`Tenant creado: ${tenant.id}`);
  console.log(`Usuarios creados: ${user1.email}, ${user2.email}`);
  console.log("Categorías y posts creados correctamente.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });