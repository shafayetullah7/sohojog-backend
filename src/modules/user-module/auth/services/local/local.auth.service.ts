import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordManagerService } from 'src/modules/common/password-manager/password-manager.service';
import { JwtUtilsService } from 'src/modules/common/jwt/jwt-utils.service';
import { ResponseBuilder } from 'src/modules/common/response-builder/response.builder';
import { UserService } from '../../../user/user.service';
import { CreateUserBodyDto } from '../../dto/create.user.dto';
import { LoginUserBodyDto } from '../../dto/login.user.dto';
import { Role } from 'src/constants/enums/user.roles';
import { JwtPayload } from 'src/constants/interfaces/jwt.payload';
import { getSafeUserInfo } from 'src/shared/utils/filters/safe.user.info.filter';
import { EmailService } from 'src/modules/common/email/email.service';
import { OtpService } from 'src/modules/common/otp/otp.service';
import { User } from '@prisma/client';

@Injectable()
export class LocalAuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordManager: PasswordManagerService,
    private readonly jwtUtilsService: JwtUtilsService,
    private readonly response: ResponseBuilder<any>,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
  ) {}

  async signUp(data: CreateUserBodyDto): Promise<ResponseBuilder<User>> {
    const result = await this.prismaService.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: { email: data.email },
      });
      console.log('existingUser', existingUser);
      if (existingUser) {
        throw new ConflictException('User already exists with this email');
      }

      data.password = await this.passwordManager.hashPassword(data.password);

      const user = await tx.user.create({ data });
      if (!user) {
        throw new InternalServerErrorException('Failed to sign up');
      }

      const safeUser = getSafeUserInfo(user);
      const tokenPayload: JwtPayload = {
        userId: safeUser.id,
        email: safeUser.email,
        verified: safeUser.verified,
        roles: [Role.User],
      };
      const token = this.jwtUtilsService.generateToken(tokenPayload);
      const refreshToken =
        this.jwtUtilsService.generateRefreshToken(tokenPayload);

      const otp = await this.otpService.createOto(tx, { email: user.email });

      await this.emailService.sendWelcomeVerificationOtp(
        user.email,
        otp,
        user.name,
      );
      if (user) {
        return this.response
          .setVerificationRequired(true)
          .setData({ user: safeUser })
          .setToken(token)
          .setRefreshToken(refreshToken)
          .setMessage('User created. Please verify your email to continue.');
      } else {
        throw new InternalServerErrorException('Failed to sign up.');
      }
    });
    return result;
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    console.log('finding user', user);

    if (!user.hasPassword || !user.password) {
      throw new UnauthorizedException('Invalid password');
    }

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
    const user = await this.prismaService.user.findFirst({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (!user.hasPassword || !user.password) {
      throw new UnauthorizedException('Invalid password');
    }
    const passMatch = await this.passwordManager.matchPassword(
      password,
      user.password,
    );

    // console.log('****************');

    if (!passMatch) {
      throw new UnauthorizedException('Invalid credential.');
    }

    const safeUser = getSafeUserInfo(user);
    const tokenPayload: JwtPayload = {
      userId: safeUser.id,
      email: safeUser.email,
      verified: safeUser.verified,
      roles: [Role.User],
    };
    const token = this.jwtUtilsService.generateToken(tokenPayload);
    const refreshToken =
      this.jwtUtilsService.generateRefreshToken(tokenPayload);

    return this.response
      .setData({ user: safeUser })
      .setToken(token)
      .setRefreshToken(refreshToken)
      .setMessage('Logged in.');
  }

  async verifyUser(userId: string, hashedOtp: string) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (user.verified) {
      throw new ConflictException('User is already verified.');
    }

    const otpMatched = await this.otpService.verifyOtp(user.email, hashedOtp);
    if (!otpMatched) {
      throw new BadRequestException('Invalid otp.');
    }

    const updatedUser = this.prismaService.user.update({
      where: { id: userId },
      data: { verified: true },
    });

    const safeUser = getSafeUserInfo(user);
    const tokenPayload: JwtPayload = {
      userId: safeUser.id,
      email: safeUser.email,
      verified: safeUser.verified,
      roles: [Role.User],
    };
    const token = this.jwtUtilsService.generateToken(tokenPayload);
    const refreshToken =
      this.jwtUtilsService.generateRefreshToken(tokenPayload);

    return this.response
      .setData({ user: safeUser })
      .setToken(token)
      .setRefreshToken(refreshToken)
      .setMessage('User verified.');
  }

  async refreshToken(userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      verified: user.verified,
      roles: [Role.User],
    };

    const accessToken = this.jwtUtilsService.generateToken(payload);

    const safeUser = getSafeUserInfo(user);

    // return { accessToken, refreshToken: newRefreshToken };
    return this.response
      .setToken(accessToken)
      .setSessionExpierity(true)
      .setData(safeUser)
      .setMessage('Token refreshed.');
  }
}
// async sendVerificationMail(data: { id: string; email: string }) {

// }
