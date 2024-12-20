import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { WsAuthModule } from 'src/ws-auth/ws-auth.module';
import { JwtModule } from '@nestjs/jwt';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { JwtUtilsModule } from 'src/shared/shared-modules/jwt/jwt-utils.module';

@Module({
  providers: [ChatGateway],
  imports: [
    WsAuthModule,
    ChatModule,
    JwtModule,
    WebsocketModule,
    JwtUtilsModule,
  ],
})
export class ChatModule {}
