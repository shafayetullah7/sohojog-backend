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

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtUtilsService: JwtUtilsService,
    private readonly messageService: MessageService,
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

  handleDisconnect(client: Socket) {
    console.log(
      `User disconnected: ${client.data.user?.userId || 'Unknown User'}`,
    );
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

      console.log({ rooms:client.rooms });

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
