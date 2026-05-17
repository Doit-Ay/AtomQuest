// @ts-nocheck
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          console.log("[auth] Attempting login for:", credentials.email);
          console.log("[auth] DIRECT_URL set:", !!process.env.DIRECT_URL);
          console.log("[auth] DATABASE_URL set:", !!process.env.DATABASE_URL);

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          console.log("[auth] User found:", !!user);

          if (!user) return null;

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          console.log("[auth] Password valid:", isValid);

          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
          };
        } catch (error) {
          console.error("[auth] Login error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as Record<string, unknown>).role as string;
        token.department = (user as Record<string, unknown>).department as string;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session.user as any;
        user.role = token.role;
        user.department = token.department;
        user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
