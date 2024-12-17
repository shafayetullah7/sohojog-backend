import { Module } from '@nestjs/common';
import { RoomService } from './room/room.service';
import { MessageService } from './message/message.service';

@Module({
  providers: [RoomService, MessageService],
  exports: [RoomService, MessageService],
})
export class WebsocketModule {}
