import { Module } from '@nestjs/common';
import { ResponseBuilder } from './response.builder';

@Module({
  providers: [ResponseBuilder],
  exports: [ResponseBuilder], // Export if you need to use it in other modules
})
export class ResponseBuilderModule {}
