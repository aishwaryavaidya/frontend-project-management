// src/hooks/useHasRole.ts
'use client';

import { ROLES, roleHierarchy } from "@/lib/utils/roles";
import { useSession } from "next-auth/react";


export function useHasRole(requiredRole: keyof typeof ROLES) {
  const { data: session } = useSession();
  
  if (!session?.user) return false;
  
  const userRole = session.user.role as keyof typeof ROLES;
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}