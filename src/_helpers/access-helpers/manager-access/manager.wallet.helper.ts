import { Prisma, PrismaClient } from '@prisma/client';
import { getSafeUserInfo } from 'src/shared/utils/filters/safe.user.info.filter';

const getManagerWallet = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: string,
  walletId: string,
) => {
  const managerWallet = await prisma.wallet.findFirst({
    where: {
      id: walletId,
      project: {
        participations: {
          some: {
            userId,
            adminRole: {
              some: { active: true },
            },
          },
        },
      },
    },
    include: {
      project: {
        include: {
          participations: {
            where: { userId },
            include: {
              adminRole: true,
              user: true,
            },
          },
        },
      },
    },
  });

  if (!managerWallet) return managerWallet;
  const { project: projectData, ...wallet } = managerWallet;

  const { participations, ...project } = projectData;
  const managerParticipation = participations.find(
    (participation) => participation.userId === userId,
  );
  if (!managerParticipation) return null;
  const { adminRole, user, ...participation } = managerParticipation;

  return {
    project,
    wallet,
    manager: { user: getSafeUserInfo(user), adminRole, participation },
  };
};

export const managerWalletHelper = {
  getManagerWallet,
};
