import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { roleHierarchy } from "@/lib/utils/roles";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // If no token exists, user is not logged in
    if (!token?.role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const userRoleLevel = roleHierarchy[token.role as keyof typeof roleHierarchy];

    // Admin only routes
    if (path.startsWith("/admin")) {
      if (userRoleLevel < roleHierarchy.ADMIN) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Project Manager and above routes
    if (path.startsWith("/dashboard/plan")) {
      if (userRoleLevel < roleHierarchy.PROJECT_MANAGER) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Program Manager and above routes
    if (path.startsWith("/programs")) {
      if (userRoleLevel < roleHierarchy.PROGRAM_MANAGER) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Project routes - accessible by Project Manager and above
    // if (path.startsWith("/projects")) {
    //   if (userRoleLevel < roleHierarchy.PROJECT_MANAGER) {
    //     return NextResponse.redirect(new URL("/unauthorized", req.url));
    //   }
    // }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Update the matcher to include all protected routes
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    // "/projects/:path*",
    "/programs/:path*",
    "/profile/:path*",
  ],
};