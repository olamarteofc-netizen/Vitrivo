import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginInputSchema } from "@/lib/validation/auth";
import { verifyAdminPassword, touchLastLogin } from "@/lib/services/admin-users";
import { checkRateLimit } from "@/lib/rate-limit";
import { getServerEnv } from "@/config/env";

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  secret: getServerEnv().NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = loginInputSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const forwardedFor = req.headers?.["x-forwarded-for"];
        const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0] ?? "unknown";
        const rateLimitKey = `login:${ip}:${parsed.data.email}`;
        const result = checkRateLimit(rateLimitKey, LOGIN_LIMIT, LOGIN_WINDOW_MS);
        if (!result.allowed) {
          throw new Error("Muitas tentativas de login. Tente novamente em alguns minutos.");
        }

        const admin = await verifyAdminPassword(parsed.data.email, parsed.data.password);
        if (!admin) return null;

        await touchLastLogin(admin.id);

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "ADMIN";
      }
      return session;
    },
  },
};
