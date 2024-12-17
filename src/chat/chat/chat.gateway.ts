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
import { JwtService } from '@nestjs/jwt';
import { RoomService } from 'src/websocket/room/room.service';
import { MessageService } from 'src/websocket/message/message.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from 'src/ws-auth/ws-jwt-auth/ws-jwt-auth.guard';
// import { WsJwtAuthGuard } from '../../auth/guards/ws-jwt-auth.guard';
// import { UseGuards } from '@nestjs/common';
// import { RoomService } from '../../websocket/services/room.service';
// import { MessageService } from '../../websocket/services/message.service';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly roomService: RoomService,
    private readonly messageService: MessageService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string;
      const user = this.jwtService.verify(token);
      client.data.user = user;
      console.log(`User ${user.id} connected.`);
      
    } catch (error) {
      console.log('Unauthorized connection attempt.');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`User ${client.data.user?.id} disconnected.`);
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    const user = client.data.user;
    this.roomService.joinRoom(roomId, user.id);
    client.join(roomId);
    this.server.to(roomId).emit('user_joined', { userId: user.id });
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('send_message')
  handleMessage(
    @MessageBody() data: { roomId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, content } = data;
    const user = client.data.user;
    const message = {
      userId: user.id,
      content,
      timestamp: new Date(),
    };
    this.messageService.sendMessage(this.server, roomId, message);
  }
}
