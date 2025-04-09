export enum UserRole {
  USER = 'user',
  PORTADOR = 'portador',
  TUTOR = 'tutor',
  COLABORADOR = 'colaborador',
  PRESTADOR = 'prestador',
  AUDITOR = 'auditor',
  ADMIN = 'admin',
}

// Hierarquia de roles (do menor para o maior nível de permissão)
export const ROLE_HIERARCHY = [
  UserRole.USER,
  UserRole.PORTADOR,
  UserRole.TUTOR,
  UserRole.COLABORADOR,
  UserRole.PRESTADOR,
  UserRole.AUDITOR,
  UserRole.ADMIN,
];
