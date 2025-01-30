export const ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    PROGRAM_MANAGER: 'PROGRAM_MANAGER',
    PROJECT_MANAGER: 'PROJECT_MANAGER',
    SUPER_USER: 'SUPER_USER'
  } as const;
  
  export type Role = keyof typeof ROLES;
  
  export const roleHierarchy: Record<Role, number> = {
    USER: 0,
    PROJECT_MANAGER: 1,
    PROGRAM_MANAGER: 2,
    ADMIN: 3,
    SUPER_USER: 4,
  };