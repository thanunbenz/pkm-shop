import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import prisma from "@/lib/db";
import { createRefreshToken } from "@/lib/utils/refresh-token";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not defined in environment variables");
}

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
            id: String(user.id),
            email: user.email,
            name: `${user.fname} ${user.lname}`,
            fname: user.fname,
            lname: user.lname,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth Error:", error);
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
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user }) {
      // Create refresh token when user signs in
      if (user?.id) {
        try {
          await createRefreshToken(Number(user.id));
          return true;
        } catch (error) {
          console.error("Error creating refresh token:", error);
          // Still allow sign in even if refresh token creation fails
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email || "";
        token.fname = user.fname;
        token.lname = user.lname;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
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
