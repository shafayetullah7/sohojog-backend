import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import { SendMessageDto } from './dto/send.message.dto';
import { UploadApiResponse } from 'cloudinary';
import { FileService } from 'src/shared/shared-modules/file/file.service';
import { File } from '@prisma/client';
import { GetGroupMessageQueryDto } from './dto/get.group.messages.dto';
import { ProjectGroupQueryDto } from './dto/project.group.query.dto';
import { GetMessageRoomsQueryDto } from './dto/get.message.rooms.dto';
import { SendCleanMessageDto } from './dto/send.clean.message.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<unknown>,
    private readonly fileService: FileService,
  ) {}

  async getProjectChats(userId: string, query: ProjectGroupQueryDto) {
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
        group: {
          room: {
            lastMessage: {
              createdAt: 'desc',
            },
          },
        },
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
        group: {
          select: {
            id: true,
            name: true,
            room: {
              select: {
                id: true,
                lastMessage: {
                  select: {
                    id: true,
                    content: true,
                    createdAt: true,
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
                  },
                },
                _count: {
                  select: {
                    participants: true,
                  },
                },
              },
            },
          },
        },
        teams: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            _count: {
              select: {
                memberShips: true,
              },
            },
            group: {
              select: {
                id: true,
                name: true,
                room: {
                  select: {
                    id: true,
                    lastMessage: {
                      select: {
                        id: true,
                        content: true,
                        createdAt: true,
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
                      },
                    },
                    _count: {
                      select: {
                        participants: true,
                      },
                    },
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

    return this.response
      .setSuccess(true)
      .setMessage('Group chats fetched')
      .setData({ projects: modifiedChats });
  }

  // async getMessageRooms(userId: string, query: GetMessageRoomsQueryDto) {
  //   const rooms = await this.prisma.room.findMany({
  //     where: {
  //       participants: {
  //         some: {
  //           userId,
  //         },
  //       },
  //     },
  //     select: {
  //       id: true,
  //       group: {
  //         select: {
  //           name: true,
  //           Project: {
  //             select: {
  //               id: true,
  //               title: true,
  //               participations: {
  //                 where: {
  //                   userId,
  //                 },
  //                 select: {
  //                   adminRole: {
  //                     where: { active: true },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           Team:{
  //             select:{
  //               id:true,
  //               name:true
  //             }
  //           }
  //         },
  //       },
  //     },
  //   });
  // }

  async sendMessageToRoom(
    userId: string,
    payload: SendMessageDto,
    files: UploadApiResponse[],
  ) {
    const { roomId, content } = payload;

    const result = await this.prisma.$transaction(async (prismaTransaction) => {
      const room = await prismaTransaction.room.findFirst({
        where: {
          id: roomId,
          participants: {
            some: {
              userId,
            },
          },
        },
      });

      if (!room) {
        throw new NotFoundException('Chat not found');
      }

      let uploadedFiles: File[] = [];

      if (files?.length) {
        uploadedFiles = await this.fileService.insertMultipleFiles(
          files,
          userId,
          prismaTransaction,
        );
      }

      const individuals = await prismaTransaction.roomParticipant.findMany({
        where: {
          roomId,
          NOT: {
            userId,
          },
        },
      });
      const message = await prismaTransaction.message.create({
        data: {
          content,
          senderId: userId,
          roomMessage: {
            create: {
              roomId: room.id,
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

      await prismaTransaction.messageReceiver.createMany({
        data: individuals.map((individual) => ({
          receiverId: individual.userId,
          messageId: message.id,
        })),
      });

      const sentMessage = await prismaTransaction.message.findUnique({
        where: {
          id: message.id,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          files: {
            select: {
              file: {
                select: {
                  id: true,
                  file: true,
                  fileType: true,
                  fileName: true,
                  extension: true,
                },
              },
            },
          },
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
        },
      });

      // this.chatGateway.handleSendMessage()

      return sentMessage;
    });

    return this.response
      .setSuccess(true)
      .setMessage('Message sent')
      .setData({ message: result });
  }

  async sendCleanMessageToRoom(userId: string, payload: SendCleanMessageDto) {
    const { roomId, content, fileIds } = payload;

    const result = await this.prisma.$transaction(async (prismaTransaction) => {
      const user = await prismaTransaction.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const room = await prismaTransaction.room.findFirst({
        where: {
          id: roomId,
          participants: {
            some: {
              userId,
            },
          },
        },
      });

      if (!room) {
        throw new NotFoundException('Chat not found');
      }

      let uploadedFiles: File[] = [];

      if (fileIds?.length) {
        uploadedFiles = await prismaTransaction.file.findMany({
          where: {
            id: {
              in: fileIds,
            },
            uploadBy: userId,
          },
        });
      }

      fileIds.forEach((id) => {
        if (!uploadedFiles.find((file) => file.id === id)) {
          throw new NotFoundException('Certain file not found');
        }
      });

      const individuals = await prismaTransaction.roomParticipant.findMany({
        where: {
          roomId,
          NOT: {
            userId,
          },
        },
      });
      const message = await prismaTransaction.message.create({
        data: {
          content,
          senderId: userId,
          roomMessage: {
            create: {
              roomId: room.id,
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

      await prismaTransaction.messageReceiver.createMany({
        data: individuals.map((individual) => ({
          receiverId: individual.userId,
          messageId: message.id,
        })),
      });

      const sentMessage = await prismaTransaction.message.findUnique({
        where: {
          id: message.id,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          files: {
            select: {
              file: {
                select: {
                  id: true,
                  file: true,
                  fileType: true,
                  fileName: true,
                  extension: true,
                },
              },
            },
          },
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
        },
      });

      return sentMessage;
    });

    // return this.response
    //   .setSuccess(true)
    //   .setMessage('Message sent')
    //   .setData({ message: result });
    return result;
  }

  async getMessages(
    userId: string,
    roomId: string,
    query: GetGroupMessageQueryDto,
  ) {
    const { page, limit } = query;

    const room = await this.prisma.room.findUnique({
      where: {
        id: roomId,
        participants: {
          some: {
            userId,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Chat not found');
    }

    const offset = (page - 1) * limit;

    // Fetch paginated messages
    const messages = await this.prisma.message.findMany({
      where: {
        roomMessage: {
          roomId,
        },
      },
      include: {
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
        files: {
          include: {
            file: true,
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
        roomMessage: {
          roomId,
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
