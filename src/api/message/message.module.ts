import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/shared-modules/response-builder/response.builder.module';
import { UserModule } from '../user-module/user/user.module';
import { FileModule } from 'src/shared/shared-modules/file/file.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
  imports: [PrismaModule, ResponseBuilderModule, UserModule, FileModule],
})
export class MessageModule {}
