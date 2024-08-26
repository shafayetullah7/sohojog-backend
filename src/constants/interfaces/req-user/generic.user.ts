import { Role } from 'src/constants/enums/user.roles';

export interface GenericUser {
  userId: string;
  email: string;
  verified: boolean;
  roles: Role[];
}
