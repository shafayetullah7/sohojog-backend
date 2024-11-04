import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import {
  getSafeUserInfo,
  SafeUserInfo,
} from 'src/shared/utils/filters/safe.user.info.filter';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/user.update.dto';

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

  async getMe(id: string): Promise<ResponseBuilder<SafeUserInfo>> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: { profilePicture: true },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const safeUser = getSafeUserInfo(user);

    return this.response
      .setSuccess(true)
      .setData({ user: safeUser })
      .setMessage('User retreived.');
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    // Check if the user exists
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update only the name
    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { name: updateUserDto.name },
      include: {
        profilePicture: true,
      },
    });
    const safeUser = getSafeUserInfo(updatedUser);

    return this.response
      .setSuccess(true)
      .setMessage('User updated successfully')
      .setData(safeUser);
  };
}
