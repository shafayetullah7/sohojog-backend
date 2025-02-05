import { Prisma, PrismaClient } from '@prisma/client';
import { getSafeUserInfo } from 'src/shared/utils/filters/safe.user.info.filter';

const getManagerTeamWallet = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: string,
  walletId: string,
) => {
  const managerTeamWallet = await prisma.teamWallet.findFirst({
    where: {
      id: walletId,
      team: {
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
    },
    include: {
      team: {
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
              wallet: true,
            },
          },
        },
      },
    },
  });

  if (!managerTeamWallet) return managerTeamWallet;
  const { team: teamData, ...teamWallet } = managerTeamWallet;
  const { project: projectData, ...team } = teamData;
  const { participations, wallet: projectWallet, ...project } = projectData;
  const managerParticipation = participations.find(
    (participation) => participation.userId === userId,
  );
  if (!managerParticipation) return null;
  const { adminRole, user, ...participation } = managerParticipation;

  // const projectWallet = projectWallets
  return {
    project,
    projectWallet,
    team,
    teamWallet,
    manager: { user: getSafeUserInfo(user), adminRole, participation },
  };
};

export const managerTeamWalletHelper = {
  getManagerTeamWallet,
};
