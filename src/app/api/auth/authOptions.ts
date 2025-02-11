import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { NextAuthOptions } from "next-auth";
import prisma from "../../lib/db";
import { PrismaAdapter } from '@next-auth/prisma-adapter';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "example@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials) {
                    throw new Error("No credentials provided.");
                }

                const { email, password } = credentials;

                try {
                    const user = await prisma.user.findUnique({
                        where: { email },
                    });

                    if (!user) {
                        throw new Error("The email address you entered is not registered.");
                    }

                    const isValid = await compare(password, user.password);

                    if (!isValid) {
                        throw new Error("The password you entered is incorrect.");
                    }

                    return {
                        id: user.id,
                        fname: user.fname,
                        lname: user.lname,
                        email: user.email,
                        role: user.role,
                    };
                } catch (error) {
                    console.error("Authorization Error:", error);
                    throw new Error("An error occurred during authentication.");
                }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 1 * 24 * 60 * 60, // 1 day
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
        error: "/auth/error",
    },
    adapter: PrismaAdapter(prisma),
    debug: process.env.NODE_ENV === "development",
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google" || account?.provider === "facebook") {
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email! },
                    include: { Account: true },
                });

                if (existingUser) {
                    const existingAccount = await prisma.account.findFirst({
                        where: {
                            provider: account.provider,
                            providerAccountId: account.providerAccountId,
                        },
                    });

                    if (!existingAccount) {
                        await prisma.account.create({
                            data: {
                                userId: existingUser.id,
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                access_token: account.access_token,
                                expires_at: account.expires_at,
                                token_type: account.token_type,
                                scope: account.scope,
                                id_token: account.id_token,
                                session_state: account.session_state,
                            },
                        });
                    }
                } else {
                    await prisma.user.create({
                        data: {
                            email: user.email!,
                            fname: profile?.name?.split(" ")[0] || "unknown",
                            lname: profile?.name?.split(" ")[1] || "unknown",
                            role: "USER",
                            Account: {
                                create: {
                                    type: account.type,
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                    access_token: account.access_token,
                                    expires_at: account.expires_at,
                                    token_type: account.token_type,
                                    scope: account.scope,
                                    id_token: account.id_token,
                                    session_state: account.session_state,
                                },
                            },
                        },
                    });
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.fname = user.fname;
                token.lname = user.lname;
                token.email = user.email;
                token.role = user.role;
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.id,
                    fname: token.fname,
                    lname: token.lname,
                    email: token.email,
                    role: token.role,
                };
            }

            return session;
        },
    },
};