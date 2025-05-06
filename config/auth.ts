import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";


export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 2, // 2 hours session expiration
    updateAge: 0, // Disable automatic session updates
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login", // Add error page
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        employee_code: { label: "Employee Code", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req): Promise<User | null> {
        try {
          console.log("Attempting login with:", credentials);

          const response = await fetch(`http://127.0.0.1:8000/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employee_code: credentials?.employee_code,
              password: credentials?.password,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Invalid credentials");
          }

          return data;  // Should return { access, refresh, name, code }
        } catch (error) {
          console.error("Login failed:", error);
          throw new Error(error instanceof Error ? error.message : "Invalid credentials");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback", { token, user });
      if (user) {
        token.accessToken = user.access;
        token.refreshToken = user.refresh;
        token.name = user.name;
        token.code = user.code;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback", { session, token });
      if (session.user && token) {
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.user.name = token.name as string;
        session.user.code = token.code as string;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token.refreshToken) {
        try {
          // Call Django logout endpoint to blacklist the token
          await fetch('http://127.0.0.1:8000/logout/', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token.accessToken}`
            },
            body: JSON.stringify({ refresh: token.refreshToken }),
          });
        } catch (error) {
          console.error('Error during sign out:', error);
        }
      }
    }
  }
};