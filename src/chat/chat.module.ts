import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { WsAuthModule } from 'src/ws-auth/ws-auth.module';
import { JwtModule } from '@nestjs/jwt';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { JwtUtilsModule } from 'src/shared/shared-modules/jwt/jwt-utils.module';
import { MessageModule } from 'src/api/message/message.module';

@Module({
  providers: [ChatGateway],
  imports: [WsAuthModule, ChatModule, WebsocketModule, JwtUtilsModule, MessageModule],
  exports: [ChatGateway],
})
export class ChatModule {}
