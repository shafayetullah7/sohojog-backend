import { Prisma, PrismaClient } from '@prisma/client';
import { getSafeUserInfo } from 'src/shared/utils/filters/safe.user.info.filter';

const getManagerProject = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  managerId: string,
  participationId: string,
) => {
  const participation = await prisma.participation.findFirst({
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
};

export const managerProjectHelper = {
  getManagerProject,
};
