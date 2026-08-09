import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN'>) =>
  SetMetadata(ROLES_KEY, roles);
