import { SetMetadata } from '@nestjs/common';
import { Role } from '../../constants/enums/user.roles';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
