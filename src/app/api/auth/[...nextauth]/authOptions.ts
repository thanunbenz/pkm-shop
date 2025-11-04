import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import prisma from "@/lib/db";
import { createRefreshToken } from "@/lib/utils/refresh-token";
import logger from "@/lib/logger";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not defined in environment variables");
}

// ✅ Session timeout configuration (can be overridden via environment variables)
const SESSION_MAX_AGE = process.env.SESSION_MAX_AGE
  ? parseInt(process.env.SESSION_MAX_AGE)
  : 30 * 24 * 60 * 60; // Default: 30 days

const SESSION_UPDATE_AGE = process.env.SESSION_UPDATE_AGE
  ? parseInt(process.env.SESSION_UPDATE_AGE)
  : 24 * 60 * 60; // Default: 24 hours

const SESSION_IDLE_TIMEOUT = process.env.SESSION_IDLE_TIMEOUT
  ? parseInt(process.env.SESSION_IDLE_TIMEOUT)
  : 7 * 24 * 60 * 60 * 1000; // Default: 7 days in milliseconds

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email และ password จำเป็นต้องระบุ");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            // Delay response to prevent timing attacks
            await new Promise((resolve) => setTimeout(resolve, 1000));
            throw new Error("ไม่พบอีเมลนี้ในระบบ");
          }

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            // Delay response to prevent timing attacks
            await new Promise((resolve) => setTimeout(resolve, 1000));
            throw new Error("รหัสผ่านไม่ถูกต้อง");
          }

          return {
            id: user.id.toString(), // Convert number to string for NextAuth
            email: user.email,
            name: `${user.fname} ${user.lname}`,
            fname: user.fname,
            lname: user.lname,
            role: user.role,
          };
        } catch (error) {
          logger.error("Auth Error:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
          });
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE, // Maximum session lifetime (default: 30 days)
    updateAge: SESSION_UPDATE_AGE, // Refresh session if active (default: 24 hours)
  },
  callbacks: {
    async signIn({ user }) {
      // Create refresh token when user signs in
      if (user?.id) {
        try {
          // Convert string ID back to number for database
          await createRefreshToken(parseInt(user.id));
          return true;
        } catch (error) {
          logger.error("Error creating refresh token:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
          });
          // Still allow sign in even if refresh token creation fails
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id; // Store as string
        token.email = user.email || "";
        token.fname = user.fname;
        token.lname = user.lname;
        token.role = user.role;
        token.lastActivity = Date.now(); // Track last activity
        token.createdAt = Date.now(); // Track session creation
      }

      // ✅ Idle timeout check (configurable, default: 7 days of inactivity)
      const now = Date.now();
      const lastActivity = (token.lastActivity as number) || now;

      if (now - lastActivity > SESSION_IDLE_TIMEOUT) {
        // Session expired due to inactivity
        logger.warn("Session expired due to inactivity", {
          userId: token.id,
          lastActivity: new Date(lastActivity).toISOString(),
          idleTime: `${Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24))} days`,
        });
        // Return null to invalidate session
        return null as any;
      }

      // ✅ Update last activity timestamp on every request
      // Only update if more than 5 minutes have passed (to reduce writes)
      const UPDATE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
      if (trigger === "update" || (now - lastActivity > UPDATE_THRESHOLD)) {
        token.lastActivity = now;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id; // Already string type
        session.user.email = token.email as string;
        session.user.fname = token.fname as string;
        session.user.lname = token.lname as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
