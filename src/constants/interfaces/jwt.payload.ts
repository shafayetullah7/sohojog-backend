import { Role } from '../enums/user.roles';

export interface JwtPayload {
  userId: string;
  email: string;
  verified: boolean;
  roles: Role[];
}
