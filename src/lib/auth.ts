// @ts-nocheck
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Microsoft Graph API helpers for org hierarchy & role mapping
async function fetchAzureADProfile(accessToken: string) {
  try {
    // Fetch user profile with manager info
    const [profileRes, managerRes, groupsRes] = await Promise.allSettled([
      fetch("https://graph.microsoft.com/v1.0/me?$select=displayName,mail,department,jobTitle", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch("https://graph.microsoft.com/v1.0/me/manager", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch("https://graph.microsoft.com/v1.0/me/memberOf?$select=displayName,id", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const profile = profileRes.status === "fulfilled" ? await profileRes.value.json() : null;
    const manager = managerRes.status === "fulfilled" && managerRes.value.ok
      ? await managerRes.value.json()
      : null;
    const groupsData = groupsRes.status === "fulfilled" && groupsRes.value.ok
      ? await groupsRes.value.json()
      : null;

    const groups = groupsData?.value?.map((g: any) => g.displayName?.toLowerCase()) || [];

    return { profile, manager, groups };
  } catch (error) {
    console.error("[auth] Graph API error:", error);
    return { profile: null, manager: null, groups: [] };
  }
}

// Map Azure AD groups to application roles
function mapGroupsToRole(groups: string[]): string {
  // Configurable group-to-role mapping
  const adminGroups = (process.env.AZURE_AD_ADMIN_GROUPS || "atmoquest-admin,hr-admin,system-admin").toLowerCase().split(",");
  const managerGroups = (process.env.AZURE_AD_MANAGER_GROUPS || "atmoquest-manager,team-leads,managers").toLowerCase().split(",");

  if (groups.some(g => adminGroups.some(ag => g.includes(ag.trim())))) return "ADMIN";
  if (groups.some(g => managerGroups.some(mg => g.includes(mg.trim())))) return "MANAGER";
  return "EMPLOYEE";
}

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
                scope: "openid profile email User.Read User.ReadBasic.All",
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
      // Auto-provision & sync users from Microsoft Entra ID
      if (account?.provider === "microsoft-entra-id" && user.email) {
        try {
          // Fetch org hierarchy & groups from Microsoft Graph
          const { profile, manager, groups } = await fetchAzureADProfile(
            account.access_token || ""
          );

          // Determine role from Azure AD group membership
          const mappedRole = mapGroupsToRole(groups);
          const department = profile?.department || "General";

          // Find or auto-link manager via Azure AD reporting line
          let managerId: string | null = null;
          if (manager?.mail) {
            const managerUser = await prisma.user.findUnique({
              where: { email: manager.mail },
            });
            if (managerUser) {
              managerId = managerUser.id;
            }
          }

          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Auto-create user from Azure AD with org hierarchy
            await prisma.user.create({
              data: {
                email: user.email,
                name: profile?.displayName || user.name || user.email.split("@")[0],
                password: await bcrypt.hash(crypto.randomUUID(), 10),
                role: mappedRole,
                department,
                managerId,
              },
            });
            console.log(`[auth] Provisioned Azure AD user: ${user.email} | Role: ${mappedRole} | Manager: ${manager?.mail || "none"}`);
          } else {
            // Sync org hierarchy on every login (keeps reporting lines up-to-date)
            const updateData: any = {};
            if (profile?.department && profile.department !== existingUser.department) {
              updateData.department = profile.department;
            }
            if (managerId && managerId !== existingUser.managerId) {
              updateData.managerId = managerId;
            }
            // Only update role from groups if not manually overridden by admin
            if (groups.length > 0 && mappedRole !== existingUser.role) {
              updateData.role = mappedRole;
            }

            if (Object.keys(updateData).length > 0) {
              await prisma.user.update({
                where: { email: user.email },
                data: updateData,
              });
              console.log(`[auth] Synced Azure AD profile for ${user.email}:`, updateData);
            }
          }
        } catch (error) {
          console.error("[auth] Azure AD sync error:", error);
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
  trustHost: true,
});
