import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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

  constructor() {}

  async handleConnection(client: Socket) {
    try {
      console.log('connected to chat', client.id);
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
}
