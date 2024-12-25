import { forwardRef, Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { JwtUtilsModule } from 'src/shared/shared-modules/jwt/jwt-utils.module';
import { MessageModule } from 'src/api/message/message.module';

@Module({
  providers: [ChatGateway],
  imports: [JwtUtilsModule, forwardRef(() => MessageModule)],
  exports: [ChatGateway],
})
export class ChatModule {}
