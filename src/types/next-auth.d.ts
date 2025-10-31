import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: number
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
        id: number
        fname: string
        lname: string
        role: string
    }
} 