import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { createAdminUser, verifyAdminPassword, findAdminByEmail } from "@/lib/services/admin-users";

const email = `admin-${Date.now()}@teste.local`;

afterAll(async () => {
  await prisma.adminUser.deleteMany({ where: { email } });
});

describe("admin-users service (integração com banco)", () => {
  it("cria um administrador com senha com hash (nunca em texto puro)", async () => {
    const admin = await createAdminUser({ name: "Admin Teste", email, password: "SenhaForte123" });
    expect(admin.email).toBe(email);
    expect(admin.passwordHash).not.toBe("SenhaForte123");
    expect(admin.passwordHash.length).toBeGreaterThan(20);
  });

  it("rejeita criar outro administrador com o mesmo e-mail", async () => {
    await expect(
      createAdminUser({ name: "Duplicado", email, password: "OutraSenha123" }),
    ).rejects.toThrow();
  });

  it("autentica com senha correta", async () => {
    const admin = await verifyAdminPassword(email, "SenhaForte123");
    expect(admin?.email).toBe(email);
  });

  it("rejeita autenticação com senha incorreta", async () => {
    const admin = await verifyAdminPassword(email, "senha-errada");
    expect(admin).toBeNull();
  });

  it("rejeita autenticação para e-mail inexistente", async () => {
    const admin = await verifyAdminPassword("nao-existe@teste.local", "qualquer");
    expect(admin).toBeNull();
  });

  it("rejeita autenticação de administrador inativo", async () => {
    const found = await findAdminByEmail(email);
    await prisma.adminUser.update({ where: { id: found!.id }, data: { active: false } });
    const admin = await verifyAdminPassword(email, "SenhaForte123");
    expect(admin).toBeNull();
  });
});
