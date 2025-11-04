import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string  // Changed from number to string (NextAuth standard)
            email: string
            fname: string
            lname: string
            role: string
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        fname: string
        lname: string
        role: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string  // Changed from number to string (NextAuth standard)
        fname: string
        lname: string
        role: string
    }
} 