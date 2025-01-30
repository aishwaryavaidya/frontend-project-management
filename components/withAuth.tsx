// "use client";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { ReactNode, useEffect } from "react";
// import { Role } from "@/config/auth"; // Import the Role type

// export const withAuth = (Component: any, allowedRoles?: Role[]) => {
//   return function WithAuth(props: any) {
//     const { data: session, status } = useSession();
//     const router = useRouter();

//     useEffect(() => {
//       if (status === "loading") return;

//       // Redirect unauthenticated users
//       if (!session) {
//         router.push("/login");
//       }
//       // Redirect unauthorized users (if allowedRoles is defined)
//       else if (allowedRoles && !allowedRoles.includes(session.user.role)) {
//         router.push("/unauthorized");
//       }
//     }, [session, status, router, allowedRoles]);

//     if (status === "loading") return <div>Loading...</div>;

//     return <Component {...props} />;
//   };
// };