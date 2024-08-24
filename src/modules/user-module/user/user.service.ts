import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  createUser(data: CreateUserDto) {
    return data;
  }

  async findUserByEmail(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    return user;
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id } });
    return user;
  }
}
