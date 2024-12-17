import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
  sendMessage(server: any, roomId: string, message: { userId: string; content: string; timestamp: Date }) {
    server.to(roomId).emit('receive_message', message);
  }
}
