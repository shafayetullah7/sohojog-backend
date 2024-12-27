import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import { JwtUtilsService } from 'src/shared/shared-modules/jwt/jwt-utils.service';
import { MessagePayload } from '../dto/message.dto';
import { MessageService } from 'src/api/message/message.service';
import { OfferPayload } from '../dto/webrtc.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  getSafeUserInfo,
  SafeUserInfo,
} from 'src/shared/utils/filters/safe.user.info.filter';
import { NotFoundException } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtUtilsService: JwtUtilsService,
    private readonly messageService: MessageService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        console.warn('Connection attempt without token.');
        return client.disconnect(true);
      }

      const jwtUser: JwtUser =
        await this.jwtUtilsService.validateAccessToken(token);

      console.log('User connected to chat:', jwtUser.userId);
      client.data.user = jwtUser;
    } catch (error) {
      console.error('Unauthorized connection attempt:', error);
      client.disconnect(true);
    }
  }


  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    console.log({ data });
    if (!client.data.user) {
      client.emit('joinRoomError', {
        message: 'You must be logged in to join a room.',
      });
      return;
    }

    client.join(data.room);
    console.log(`User ${client.data.user.userId} joined room: ${data.room}`);
    this.server
      .to(data.room)
      .emit('userJoined', { userId: client.data.user.userId });
    return { success: client.rooms.has(data.room) };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // this.rooms.get(roomId)?.delete(client.id);
    if (client.rooms?.has(data.roomId)) {
      client.leave(data.roomId);
    }
    client.to(data.roomId).emit('user-left', { userId: client.data.user?.id });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MessagePayload,
  ) {
    try {
      const { roomId, content, fileIds } = payload;

      if (!roomId || (!content?.trim() && (!fileIds || fileIds.length === 0))) {
        return client.emit('sendMessageError', {
          message:
            'Invalid payload. Room ID and content or file IDs are required.',
        });
      }

      console.log({ rooms: client.rooms });

      const message = await this.messageService.sendCleanMessageToRoom(
        client.data.user?.userId,
        payload,
      );

      if (!client.rooms.has(roomId)) {
        client.join(roomId);
        console.log(`Client joined room: ${roomId}`);
      }

      this.server.to(roomId).emit('message', {
        userId: client.data.user?.userId,
        message,
      });

      console.log(
        `User ${client.data.user?.userId} sent message to room ${roomId}`,
      );
      return { success: true };
    } catch (error) {
      console.error('Error handling sendMessage:', error);
      client.emit('sendMessageError', {
        message: 'Failed to send message. Please try again.',
      });
      return {
        success: false,
        error: error?.message || 'Something went wrong',
      };
    }
  }

  /*

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: OfferPayload,
  ): { success: boolean; message?: string } {
    const { roomId, offer } = data;

    if (!roomId || !offer) {
      return {
        success: false,
        message: 'Invalid payload. Room ID and offer are required.',
      };
    }

    const rooms = Array.from(client.rooms);
    if (!rooms.includes(roomId)) {
      return {
        success: false,
        message: `You are not a member of room ${roomId}. Join the room first.`,
      };
    }

    console.log(`Received offer from client ${client.id} for room ${roomId}`);
    console.log({ offer });

    client.to(roomId).emit('offer', { senderId: client.id, offer });

    return { success: true, message: 'Offer relayed to room members.' };
  }

  */

  @SubscribeMessage('offer')
  async handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; offer: RTCSessionDescriptionInit },
  ): Promise<{ success: boolean; message?: string }> {
    const { roomId, offer } = data;

    // Validate input payload
    if (!roomId || !offer) {
      return {
        success: false,
        message: 'Invalid payload. Room ID and offer are required.',
      };
    }

    // Verify if the client is part of the specified room
    const rooms = Array.from(client.rooms);
    if (!rooms.includes(roomId)) {
      return {
        success: false,
        message: `You are not a member of room ${roomId}. Join the room first.`,
      };
    }

    // Retrieve user information from client.data
    const userId = client.data.user?.userId;

    if (!userId) {
      return {
        success: false,
        message: 'User is not authenticated.',
      };
    }

    // Fetch user information from the database (e.g., user name, profile picture)
    let userInfo: SafeUserInfo;
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profilePicture: true },
      });

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      userInfo = getSafeUserInfo(user);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return {
        success: false,
        message: 'Failed to fetch user information.',
      };
    }

    // Log the offer details
    console.log(`Received offer from user ${userId} for room ${roomId}`);
    console.log({ offer });

    // Emit the offer to the room with the user info included
    client.to(roomId).emit('offer', {
      senderId: userId, // Use client.data.user.userId
      offer,
      userInfo, // Include user information
    });

    // because we want to broadcast to everyone in the room except the sender
    // this.server.to(roomId).emit('offer', {
    //   senderId: userId,
    //   offer,
    //   userInfo,
    // });

    return { success: true, message: 'Offer relayed to room members.' };
  }

  /*
  @SubscribeMessage('answer')
  async handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: AnswerPayload,
  ): Promise<{ success: boolean; message?: string }> {
    const { roomId, answer } = data;

    if (!roomId || !answer) {
      return {
        success: false,
        message: 'Invalid payload. Room ID and answer are required.',
      };
    }

    // Check if the user is in the room
    if (!client.rooms.has(roomId)) {
      return {
        success: false,
        message: `You are not a member of room ${roomId}. Join the room first.`,
      };
    }

    console.log(`Received answer from client ${client.data.user.userId} for room ${roomId}`);
    console.log({ answer });

    // Get user info from DB (for the user answering the call)
    const userInfo = await this.userService.getUserInfoById(client.data.user.userId);

    // Emit the answer to the sender along with user info
    client.to(roomId).emit('answer', {
      senderId: client.id,
      senderInfo: userInfo,  // Send the user info in the response
      answer,
    });

    return { success: true, message: 'Answer relayed to the offer sender.' };
  }

  */

  @SubscribeMessage('answer')
  async handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      answer: RTCSessionDescriptionInit;
      offerSenderId: string;
    },
  ): Promise<{ success: boolean; message?: string }> {
    const { roomId, answer } = data;

    if (!roomId || !answer) {
      return {
        success: false,
        message:
          'Invalid payload. Room ID, answer, and offerSenderId are required.',
      };
    }

    const rooms = Array.from(client.rooms);
    if (!rooms.includes(roomId)) {
      return {
        success: false,
        message: `You are not a member of room ${roomId}. Join the room first.`,
      };
    }

    const userId = client.data.user?.userId;

    if (!userId) {
      return {
        success: false,
        message: 'User is not authenticated.',
      };
    }

    let userInfo: SafeUserInfo;
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profilePicture: true },
      });

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      userInfo = getSafeUserInfo(user);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return {
        success: false,
        message: 'Failed to fetch user information.',
      };
    }

    console.log(`Received answer from user ${userId} in room ${roomId}`);
    console.log({ answer });

    client.to(roomId).emit('answer', {
      senderId: userId,
      answer,
      userInfo,
    });

    // this.server.to(roomId).emit('answer', {
    //   senderId: userId,
    //   answer,
    //   userInfo,
    // });

    return { success: true, message: 'Answer relayed to the offer sender.' };
  }

  @SubscribeMessage('iceCandidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      candidate: RTCIceCandidateInit;
    },
  ): { success: boolean; message?: string } {
    const { roomId, candidate } = data;
    const userId = client.data.user?.userId;

    if (!roomId || !candidate || !userId) {
      return {
        success: false,
        message: 'Invalid payload or unauthorized',
      };
    }

    console.log(`Received ICE candidate from user ${userId} in room ${roomId}`);
    console.log({ candidate });

    // Broadcast ICE candidate to all participants
    // this.server.to(roomId).emit('iceCandidate', {
    //   senderId: userId,
    //   candidate,
    // });

    client.to(roomId).emit('iceCandidate', {
      senderId: userId, // The user sending the ICE candidate
      candidate, // The ICE candidate object
    });

    return { success: true };
  }

  /*
  handleDisconnect(client: Socket) {
    const userId = client.data.user?.userId;
    if (userId) {
      // Remove user from all active calls
      this.activeCallParticipants.forEach((participants, roomId) => {
        if (participants.has(userId)) {
          participants.delete(userId);
          this.server.to(roomId).emit('userLeftCall', {
            userId,
            remainingParticipants: Array.from(participants),
          });
        }
      });
    }
  }
    */

  handleDisconnect(client: Socket): void {
    console.log(`User ${client.data.user?.userId} disconnected`);

    // Notify other members in the rooms the user was part of
    const rooms = Array.from(client.rooms).filter((room) => room !== client.id); // Exclude the socket ID as a "room"
    rooms.forEach((roomId) => {
      client.to(roomId).emit('userLeft', { userId: client.data.user?.userId });
    });
  }

  @SubscribeMessage('events')
  handleEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message: string },
  ): { message: string } {
    console.log('Received event:', data);
    client.emit('eventresponse', {
      message: 'Failed to send message. Please try again.',
    });
    return { message: 'ok' };
  }
}
