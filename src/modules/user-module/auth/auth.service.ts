import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordManagerService } from 'src/shared/utils/password-manager/password-manager.service';
import { JwtUtilsService } from 'src/shared/utils/jwt-utils/jwt-utils.service';
import { ResponseBuilder } from 'src/shared/utils/response-builder/response.builder';
import { UserService } from '../user/user.service';
import { CreateUserBodyDto } from './dto/create.user.dto';
import { LoginUserBodyDto } from './dto/login.user.dto';
import { Role } from 'src/shared/enums/user.roles';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordManager: PasswordManagerService,
    private readonly jwtUtilsService: JwtUtilsService,
    private readonly response: ResponseBuilder<any>,
    private readonly userService: UserService,
  ) {}

  async signUp(data: CreateUserBodyDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: data.email },
    });
    console.log('existingUser', existingUser);
    if (existingUser) {
      console.log('************');
      throw new ConflictException('User already exists with this email');
    }
    data.password = await this.passwordManager.hashPassword(data.password);

    const user = await this.prisma.user.create({ data });
    if (!user) {
      throw new InternalServerErrorException('Failed to sign up');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...restUser } = user;
    const token = this.jwtUtilsService.generateToken({
      userId: restUser.id,
      email: restUser.email,
      verified: restUser.verified,
      roles: [Role.User],
    });
    if (user) {
      return this.response
        .setVerificationRequired(true)
        .setData({ user: restUser })
        .setToken(token)
        .setMessage('User created. Please verify your email to continue.');
    } else {
      throw new InternalServerErrorException('Failed to sign up.');
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    console.log('finding user', user);

    const passMatch = await this.passwordManager.matchPassword(
      password,
      user.password,
    );
    if (!passMatch) {
      throw new UnauthorizedException('Invalid credential.');
    }
    return {
      id: user.id,
      email: user.email,
      passwordChangedAt: user.passwordChangedAt,
      verified: user.verified,
    };
  }

  async login(data: LoginUserBodyDto) {
    const { email, password } = data;
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const passMatch = await this.passwordManager.matchPassword(
      password,
      user.password,
    );

    console.log('****************');

    if (!passMatch) {
      throw new UnauthorizedException('Invalid credential.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, prettier/prettier
    const { password: userPassword, ...rest } = user;
    const token = this.jwtUtilsService.generateToken({
      userId: rest.id,
      email: rest.email,
      verified: rest.verified,
      roles: [Role.User],
    });

    return this.response
      .setData({ user: rest })
      .setToken(token)
      .setMessage('Logged in.');
  }

  // async sendVerificationMail(data: { id: string; email: string }) {

  // }
}
