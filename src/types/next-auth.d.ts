declare module "next-auth" {
  interface User {
    fname?: string;
    lname?: string;
    role?: string;
  }

  interface Session {
    user?: User;
  }
} 