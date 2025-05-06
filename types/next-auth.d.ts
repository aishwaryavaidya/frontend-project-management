import "next-auth";


declare module "next-auth" {
  interface User {
    access: string;
    refresh: string;
    name: string;
    code: string;
  }

  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      name: string;
      code: string;
      email?: string;
      image?: string;
    };
    expires: string; // Keep this as it’s required by NextAuth
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    name?: string;
    code?: string;
  }
}