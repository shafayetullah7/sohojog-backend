import { Prisma, PrismaClient, ProjectAdminRole } from '@prisma/client';
import { getSafeUserInfo } from 'src/shared/utils/filters/safe.user.info.filter';

const getManagerMembership = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: string,
  membershipId: string,
) => {
  const membership = await prisma.teamMembership.findFirst({
    where: {
      id: membershipId,
      team: {
        project: {
          participations: {
            some: {
              userId: userId,
              adminRole: {
                some: {
                  active: true,
                  role: ProjectAdminRole.MANAGER,
                },
              },
            },
          },
        },
      },
    },
    include: {
      TeamMemberRole: true,
      participation: {
        include: { user: true },
      },
      team: {
        include: {
          project: {
            include: {
              participations: {
                where: {
                  userId,
                  adminRole: {
                    some: { role: ProjectAdminRole.MANAGER, active: true },
                  },
                },
                include: { adminRole: true, user: true },
              },
            },
          },
        },
      },
    },
  });

  if (!membership) return null;

  const {
    team,
    TeamMemberRole,
    participation: memberParticipation,
    ...teamMemberShip
  } = membership;
  const { user: memberUser, ...memberParticipationData } = memberParticipation;

  const { project, ...teamData } = team;
  const { participations, ...projectData } = project;
  const managerParticipation = participations.find(
    (participation) => participation.userId === userId,
  );
  if (!managerParticipation) return null;

  const {
    adminRole,
    user: managerUser,
    ...managerParticipationData
  } = managerParticipation;

  return {
    project: projectData,
    team: teamData,
    member: {
      membership: teamMemberShip,
      user: getSafeUserInfo(memberUser),
    },
    manager: {
      user: getSafeUserInfo(managerUser),
      adminRole,
      participation: managerParticipationData,
    },
  };
};

export const managerTeamMembership = { getManagerMembership };
