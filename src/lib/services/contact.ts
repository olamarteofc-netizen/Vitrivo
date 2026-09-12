import "server-only";
import { prisma } from "@/lib/prisma";
import { contactInputSchema, type ContactInput } from "@/lib/validation/contact";

export async function createContactMessage(rawInput: unknown) {
  const input: ContactInput = contactInputSchema.parse(rawInput);
  if (input.website) {
    // honeypot preenchido: descarta silenciosamente sem revelar ao bot.
    return null;
  }
  return prisma.contactMessage.create({
    data: { name: input.name, email: input.email, message: input.message },
  });
}

export async function listContactMessages() {
  return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}

export async function markContactMessageRead(id: string, read: boolean) {
  return prisma.contactMessage.update({ where: { id }, data: { read } });
}

export async function countUnreadContactMessages() {
  return prisma.contactMessage.count({ where: { read: false } });
}
