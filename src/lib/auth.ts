// @ts-nocheck
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Microsoft Entra ID (Azure AD) SSO
    ...(process.env.AZURE_AD_CLIENT_ID
      ? [
          MicrosoftEntraID({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID!,
            authorization: {
              params: {
                scope: "openid profile email User.Read",
              },
            },
          }),
        ]
      : []),

    // Credentials (demo login)
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) return null;

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

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
    async signIn({ user, account }) {
      // Auto-provision users from Microsoft Entra ID
      if (account?.provider === "microsoft-entra-id" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Auto-create user from Azure AD
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email.split("@")[0],
                password: await bcrypt.hash(crypto.randomUUID(), 10),
                role: "EMPLOYEE", // Default role — Admin can change later
                department: "General",
              },
            });
            console.log("[auth] Auto-provisioned Azure AD user:", user.email);
          }
        } catch (error) {
          console.error("[auth] Azure AD user provisioning error:", error);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // For credentials login — role comes from authorize()
        if ((user as any).role) {
          token.role = (user as any).role;
          token.department = (user as any).department;
          token.id = user.id;
        }
      }

      // For Azure AD login — fetch role from DB
      if (account?.provider === "microsoft-entra-id" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.department = dbUser.department;
          token.id = dbUser.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
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
  debug: true,
  trustHost: true,
});
