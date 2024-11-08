import { Image, User } from '@prisma/client';

export interface SafeProfilePicture {
  id: string;
  uploadBy: string | null;
  minUrl: string | null;
  midUrl: string | null;
  fullUrl: string | null;
  used: boolean;
}

export interface SafeUserInfo {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  passwordChangedAt: Date;
  profilePictureId?: string | null;
  profilePicture?: SafeProfilePicture | null;
  createdAt: Date;
  updatedAt: Date;
}

export const getSafeUserInfo = (
  user: User & { profilePicture?: Image | null },
): SafeUserInfo => {
  let safeProfile: SafeProfilePicture | null = null;
  if (user.profilePicture) {
    const { id, uploadBy, minUrl, midUrl, fullUrl, used } = user.profilePicture;
    safeProfile = {
      id,
      uploadBy,
      minUrl,
      midUrl,
      fullUrl,
      used,
    };
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    verified: user.verified,
    passwordChangedAt: user.passwordChangedAt,
    profilePictureId: user.profilePictureId,
    profilePicture: safeProfile,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
