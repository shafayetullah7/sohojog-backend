import { User } from '@prisma/client';

export interface SafeUserInfo {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  passwordChangedAt: Date;
  profilePicture?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const getSafeUserInfo = (user: User): SafeUserInfo => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    verified: user.verified,
    passwordChangedAt: user.passwordChangedAt,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
