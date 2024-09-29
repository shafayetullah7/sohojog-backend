import { Prisma, PrismaClient, ProjectAdminRole } from '@prisma/client';
import { getSafeUserInfo } from 'src/shared/utils/filters/safe.user.info.filter';

const getManagerProject = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: string,
  projectId: string,
) => {
  const project = await prisma.project.findFirst({
    where: {
      AND: [
        { id: projectId },
        {
          participations: {
            some: {
              userId: userId,
              adminRole: {
                some: { role: ProjectAdminRole.MANAGER, active: true },
              },
            },
          },
        },
      ],
    },
    include: {
      participations: {
        include: {
          adminRole: true,
          user: true,
        },
      },
    },
  });
  if (!project) {
    return null;
  }
  const { participations, ...rest } = project;
  const managerParticipation = participations.find(
    (participation) => participation.userId === userId,
  );
  if (!managerParticipation) return null;
  const { user, adminRole, ...participation } = managerParticipation;
  const safeUser = getSafeUserInfo(user);
  return {
    project: rest,
    manager: { user: safeUser, adminRole, participation },
  };
};

export const managerProjectHelper = {
  getManagerProject,
};
