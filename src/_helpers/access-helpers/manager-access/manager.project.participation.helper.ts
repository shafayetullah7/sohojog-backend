import { Prisma, PrismaClient } from '@prisma/client';
import { getSafeUserInfo } from 'src/shared/utils/filters/safe.user.info.filter';

const getManagerParticipant = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  managerId: string,
  participationId: string,
) => {
  const managerParticipation = await prisma.participation.findFirst({
    where: {
      id: participationId,
      project: {
        participations: {
          some: {
            adminRole: {
              some: {
                participation: {
                  userId: managerId,
                },
              },
            },
          },
        },
      },
    },
    include: {
      user: true,
      project: {
        include: {
          participations: {
            where: { userId: managerId },
            include: {
              adminRole: true,
              user: true,
            },
          },
        },
      },
    },
  });

  if (!managerParticipation) return null;
  const { project: projectData, ...participantData } = managerParticipation;
  const { user, ...participation } = participantData;
  const { participations, ...project } = projectData;
  const managerData = participations.find(
    (participation) => participation.user.id === managerId,
  );
  if (!managerData) return null;
  const {
    adminRole,
    user: managerUser,
    ...managerParticipationData
  } = managerData;

  return {
    project,
    participation: {
      user,
      participation,
    },
    manager: {
      adminRole,
      user: managerUser,
      participation: managerParticipationData,
    },
  };
};

export const managerParticipationHelper = {
  getManagerParticipant,
};
