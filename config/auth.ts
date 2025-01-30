import { NextAuthOptions, User } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/prisma/db";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 2, // 2 hours session expiration
    updateAge: 0, // Disable automatic session updates
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("Authorize function called with credentials:", credentials);
          // Check if user credentials are correct
          if (!credentials?.email || !credentials?.password) {
            throw { error: "No Inputs Found", status: 401 };
          }
          console.log("Pass 1 checked");

          // Check if user exists
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("No user found");
            throw { error: "No user found", status: 401 };
          }

          console.log("Pass 2 Checked");
          console.log(user);

          // Check if password is correct
          let passwordMatch: boolean = false;
          if (user && user.password) {
            passwordMatch = await bcrypt.compare(credentials.password, user.password);
          }

          if (!passwordMatch) {
            console.log("Password incorrect");
            throw { error: "Password Incorrect", status: 401 };
          }

          console.log("Pass 3 Checked");
          console.log("User Compiled");
          console.log(user);

          // Return a User object that matches the expected type
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: `${user.firstName} ${user.lastName}`,
          } as User; // Cast to User type
        } catch (error) {
          console.log("All Failed");
          console.log(error);
          throw { error: "Something went wrong", status: 401 };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback", { token, user });
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 2; // Expiry timestamp 2 hours
      }
      return token;
    },
    session({ session, token }) {
      console.log("Session callback", { session, token });
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        // Convert expiration timestamp to milliseconds
        session.expires = new Date((token.exp as number) * 1000).toISOString();
      }
      return session;
    },
  },
};
