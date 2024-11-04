import { Image, User } from '@prisma/client';

export interface SafeUserInfo {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  passwordChangedAt: Date;
  profilePictureId?: string | null;
  profilePicture?: Image | null;
  createdAt: Date;
  updatedAt: Date;
}

export const getSafeUserInfo = (
  user: User & { profilePicture?: Image | null },
): SafeUserInfo => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    verified: user.verified,
    passwordChangedAt: user.passwordChangedAt,
    profilePictureId: user.profilePictureId,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
