// src/hooks/useHasRole.ts
'use client';

import { ROLES } from "@/lib/utils/roles";
import { useSession } from "next-auth/react";

export const roleHierarchy = {
  USER: 0,
  PROJECT_MANAGER: 1,
  PROGRAM_MANAGER: 2,
  ADMIN: 3
} as const;

export function useHasRole(requiredRole: keyof typeof ROLES) {
  const { data: session } = useSession();
  
  if (!session?.user) return false;
  
  const userRole = session.user.role as keyof typeof ROLES;
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}