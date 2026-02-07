import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { ensureUserWorkspace } from "@/lib/auth/ensure-user-workspace";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      try {
        await ensureUserWorkspace({
          email: user.email,
          name: user.name,
        });
        return true;
      } catch {
        return false;
      }
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        const normalize = (value?: string | null) =>
          value?.trim().replace(/^['"]|['"]$/g, "") ?? "";

        const email = normalize(credentials?.email).toLowerCase();
        const password = normalize(credentials?.password);
        const expectedEmail = normalize(process.env.AUTH_DEMO_EMAIL).toLowerCase();
        const expectedPassword = normalize(process.env.AUTH_DEMO_PASSWORD);

        if (!email || !password || !expectedEmail || !expectedPassword) {
          return null;
        }

        if (email !== expectedEmail || password !== expectedPassword) {
          return null;
        }

        return {
          id: "demo-user",
          email: expectedEmail,
          name: "LeadBitz Operator",
        };
      },
    }),
  ],
};
