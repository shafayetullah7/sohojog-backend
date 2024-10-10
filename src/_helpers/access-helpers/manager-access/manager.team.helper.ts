import { Prisma, PrismaClient } from '@prisma/client';
import { getSafeUserInfo } from 'src/shared/utils/filters/safe.user.info.filter';

const getManagerTeam = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: string,
  teamId: string,
) => {
  const managerTeam = await prisma.team.findFirst({
    where: {
      id: teamId,
      project: {
        participations: {
          some: {
            userId: userId,
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

  if (!managerTeam) return managerTeam;
  const { project: projectData, ...team } = managerTeam;
  const { participations, ...project } = projectData;
  const managerParticipation = participations.find(
    (participation) => participation.userId === userId,
  );
  if (!managerParticipation) return null;
  const { adminRole, user, ...participation } = managerParticipation;

  return {
    project,
    team,
    manager: { user: getSafeUserInfo(user), adminRole, participation },
  };
};

export const managerTeamHelper = {
  getManagerTeam,
};
