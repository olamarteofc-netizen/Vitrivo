import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAdminInputSchema, type CreateAdminInput } from "@/lib/validation/auth";

const SALT_ROUNDS = 12;

export async function findAdminByEmail(email: string) {
  return prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
}

export async function touchLastLogin(id: string) {
  return prisma.adminUser.update({ where: { id }, data: { lastLoginAt: new Date() } });
}

export async function createAdminUser(rawInput: unknown) {
  const input: CreateAdminInput = createAdminInputSchema.parse(rawInput);
  const existing = await findAdminByEmail(input.email);
  if (existing) {
    throw new Error("Já existe um administrador com este e-mail.");
  }
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  return prisma.adminUser.create({
    data: { name: input.name, email: input.email, passwordHash, role: "ADMIN" },
  });
}

export async function verifyAdminPassword(email: string, password: string) {
  const admin = await findAdminByEmail(email);
  if (!admin || !admin.active) return null;
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;
  return admin;
}

export async function countAdmins() {
  return prisma.adminUser.count();
}
