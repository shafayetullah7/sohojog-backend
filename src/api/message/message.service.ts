import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import { ProjectGroupQuery } from './dto/project.group.query.dto';
import { SendMessageDto } from './dto/send.message.dto';
import { UploadApiResponse } from 'cloudinary';
import { FileService } from 'src/shared/shared-modules/file/file.service';
import { File } from '@prisma/client';
import { GetGroupMessageQueryDto } from './dto/get.group.messages.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<unknown>,
    private readonly fileService: FileService,
  ) {}

  async getProjectChats(userId: string, query: ProjectGroupQuery) {
    const { page = 1, limit = 10, groupRole } = query;

    // Calculate skip and take for pagination
    const skip = (page - 1) * limit;
    const take = limit;

    const projectChats = await this.prisma.project.findMany({
      where: {
        participations: {
          some: {
            userId,
            ...(groupRole && groupRole === 'ADMIN'
              ? {
                  adminRole: {
                    some: {
                      active: true,
                    },
                  },
                }
              : {}),
          },
        },
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        participations: {
          select: {
            id: true,
            userId: true,
            adminRole: {
              select: {
                id: true,
                createdAt: true,
                active: true,
              },
            },
          },
          where: {
            userId,
            adminRole: {
              some: {
                active: true,
              },
            },
          },
        },
        projectGroup: {
          select: {
            id: true,
            group: {
              select: {
                name: true,
                createdAt: true,
                messages: {
                  select: {
                    sender: {
                      select: {
                        id: true,
                        name: true,
                        profilePicture: {
                          select: {
                            minUrl: true,
                          },
                        },
                      },
                    },
                    message: {
                      select: {
                        // id: true,
                        content: true,
                        createdAt: true,
                        individualMessage: {
                          select: {
                            seenAt: true,
                          },
                          where: {
                            receiverId: userId,
                          },
                        },
                      },
                    },
                  },
                  take: 1,
                  orderBy: {
                    message: {
                      createdAt: 'desc',
                    },
                  },
                },
                _count: {
                  select: {
                    members: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const modifiedChats = projectChats.map((chat) => {
      if (
        chat.participations.length &&
        chat.participations[0]?.adminRole[0].active
      ) {
        const { participations, ...rest } = chat;
        const data = { admin: true, ...rest };
        return data;
      } else {
        const { participations, ...rest } = chat;
        const data = { admin: false, ...rest };
        return data;
      }
    });
  }

  async sendMessageToGroup(
    userId: string,
    payload: SendMessageDto,
    files: UploadApiResponse[],
  ) {
    const { groupId, content } = payload;

    const result = await this.prisma.$transaction(async (prismaTransaction) => {
      const group = await prismaTransaction.group.findFirst({
        where: {
          id: groupId,
          members: {
            some: {
              userId,
            },
          },
        },
      });

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      //   const message = await prismaTransaction.message.create({
      //     data: {
      //       content,
      //       groupMessage: {
      //         create: {
      //           groupId: group.id,
      //           senderId: userId,
      //         },
      //       },
      //     },
      //   });

      let uploadedFiles: File[] = [];

      if (files?.length) {
        uploadedFiles = await this.fileService.insertMultipleFiles(
          files,
          userId,
          prismaTransaction,
        );

        // if (uploadedFiles.length) {
        //   const attachmentData = uploadedFiles.map((file) => ({
        //     messageId: message.id,
        //     fileId: file.id,
        //   }));

        //   await prismaTransaction.messageFile.createMany({
        //     data: attachmentData,
        //   });
        // }
      }

      const individuals = await prismaTransaction.groupMember.findMany({
        where: {
          groupId,
          NOT: {
            userId,
          },
        },
      });
      const message = await prismaTransaction.message.create({
        data: {
          content, // Message content
          groupMessage: {
            create: {
              groupId: group.id, // Group ID
              senderId: userId, // Sender's User ID
            },
          },
          files: {
            create: uploadedFiles.map((file) => ({
              fileId: file.id,
            })),
          },
        },
        include: {
          files: true,
        },
      });

      await prismaTransaction.individualMessage.createMany({
        data: individuals.map((individual) => ({
          senderId: userId,
          receiverId: individual.userId,
          messageId: message.id,
        })),
      });

      return message;
    });

    return this.response
      .setSuccess(true)
      .setMessage('Message sent')
      .setData({ message: result });
  }

  async getGroupMessages(
    userId: string,
    groupId: string,
    query: GetGroupMessageQueryDto,
  ) {
    const { page, limit } = query;

    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: {
            userId,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const offset = (page - 1) * limit;

    // Fetch paginated messages
    const messages = await this.prisma.message.findMany({
      where: {
        groupMessage: {
          groupId,
        },
      },
      include: {
        files: {
          include: {
            file: true,
          },
        },
        groupMessage: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    const totalCount = await this.prisma.message.count({
      where: {
        groupMessage: {
          groupId,
        },
      },
    });

    return this.response
      .setSuccess(true)
      .setMessage('Messages retrieved')
      .setData({
        data: messages,
        meta: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        },
      });
  }
}
