import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GoogleAuthPayload } from 'src/constants/interfaces/third-party-data/google.auth.payload';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserWithGoogleDto } from '../../dto/google.auth.dto';
import { User } from '@prisma/client';
import { GenericUser } from 'src/constants/interfaces/req-user/generic.user';

@Injectable()
export class GoogleAuthService {
  constructor(private readonly prismaService: PrismaService) {}
  async getUserWithGoogle(googleUser: CreateUserWithGoogleDto): Promise<User> {
    const user = await this.prismaService.user.findFirst({
      where: { email: googleUser.email },
    });
    if (!user) {
      const newUser = await this.prismaService.user.create({
        data: googleUser,
      });
      return newUser;
    } else {
      return user;
    }
  }

  async loginWithGoogle(data: GenericUser) {}
}
