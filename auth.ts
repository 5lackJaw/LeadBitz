import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;
        const expectedEmail = process.env.AUTH_DEMO_EMAIL;
        const expectedPassword = process.env.AUTH_DEMO_PASSWORD;

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
