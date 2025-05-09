import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/prisma/db";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For development/testing - return a mock PM user
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // In a real implementation we would check credentials against the database
        // For now, just return a mock project manager
        const mockUser = {
          id: "pm-123",
          email: credentials.email,
          firstName: "Project",
          lastName: "Manager",
          employeeId: "PM001",
          role: "PROJECT_MANAGER"
        };

        return mockUser;
      }
    })
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.email = token.email;
        session.user.employeeId = token.employeeId;
        session.user.role = token.role;
      }

      return session;
    },
    async jwt({ token, user }) {
      const dbUser = user || await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!dbUser) {
        // For development, if no user found, use our mock user
        return {
          id: "pm-123",
          firstName: "Project",
          lastName: "Manager",
          email: token.email,
          employeeId: "PM001",
          role: "PROJECT_MANAGER",
        };
      }

      return {
        id: dbUser.id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        employeeId: dbUser.employeeId,
        role: dbUser.role,
      };
    }
  }
};

// For testing/development - mock function to get the session
export const getServerSession = async () => {
  return {
    user: {
      id: "pm-123",
      firstName: "Project",
      lastName: "Manager",
      email: "pm@example.com",
      employeeId: "PM001",
      role: "PROJECT_MANAGER"
    }
  };
};

// Type for the user in the session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      employeeId: string;
      role: string;
    };
  }
} 