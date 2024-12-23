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

type Message = {
  message: string;
};

@WebSocketGateway({
  namespace: 'chat',
  // cors: {
  //   origin: ['http://localhost:3000'],
  //   methods: ['GET', 'POST'],
  //   credentials: true,
  // },
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

      console.log('Trying to connect...');

      if (!token) {
        return client.disconnect(true);
      }

      const jwtUser: JwtUser =
        await this.jwtUtilsService.validateAccessToken(token);
      console.log('connected to chat', jwtUser.userId);

      client.data.user = jwtUser;
    } catch (error) {
      console.log('Unauthorized connection attempt.');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // console.log(`User ${client.data.user?.id} disconnected.`);
    console.log('bye');
  }

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: Message): Message {
    console.log({ data });
    return { message: 'ok' };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('room') room: string,
  ) {
    client.join(room);
    console.log(`User ${client.data.user?.userId} joined room: ${room}`);
    this.server
      .to(room)
      .emit('userJoined', { userId: client.data.user?.userId });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MessagePayload,
  ) {
    const { roomId, content, fileIds } = payload;

    const isInRoom = this.server.sockets.adapter?.rooms
      ?.get(roomId)
      ?.has(client.id);

    if (!isInRoom) {
      console.log(`User ${client.id} not in room: ${roomId}, joining now...`);

      client.join(roomId);

      console.log(`User ${client.id} successfully joined room: ${roomId}`);
      client.emit('roomStatus', { message: `Joined room: ${roomId}` });
    }

    const message = await this.messageService.sendCleanMessageToRoom(
      client.data.user?.userId,
      payload,
    );

    console.log(
      `User ${client.data.user?.userId} sent message to room ${roomId}`,
    );
    this.server.to(roomId).emit('message', {
      userId: client.data.user?.userId,
      message,
    });

    client.emit('message', {
      userId: client.data.user?.userId,
      message,
    });
  }

  sendMessageToRoom(room: string, message: string) {
    // You can call this method to send a message from outside the gateway (e.g., from a controller)
    this.server.to(room).emit('message', message);
  }
}
