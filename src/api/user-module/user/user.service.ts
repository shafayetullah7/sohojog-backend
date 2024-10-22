import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import { getSafeUserInfo } from 'src/shared/utils/filters/safe.user.info.filter';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly response: ResponseBuilder<any>,
  ) {}
  createUser(data: CreateUserDto) {
    return data;
  }

  async findUserByEmail(email: string) {
    const user = await this.prismaService.user.findFirst({ where: { email } });
    return user;
  }

  async findUserById(id: string) {
    const user = await this.prismaService.user.findFirst({ where: { id } });
    return user;
  }

  async getMe(id: string) {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const safeUser = getSafeUserInfo(user);

    return this.response
      .setData({ user: safeUser })
      .setMessage('User retreived.');
  }
}
