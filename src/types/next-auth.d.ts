import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string
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
        id: string
        fname: string
        lname: string
        role: string
    }
} 