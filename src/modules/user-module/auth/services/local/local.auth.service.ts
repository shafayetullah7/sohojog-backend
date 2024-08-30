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
import * as dayjs from 'dayjs';
import { SendOtpBodyDto } from '../../dto/send.otp.dto';
import { ResetPassBodyDto, ResetPassDataDto } from '../../dto/reset.pass.dto';
import { VerifyOtpBodyDto } from '../../dto/verify.otp.dto';
import { EmailVerificationService } from 'src/modules/common/email-verification/email-verification.service';

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
    private readonly emailVerification: EmailVerificationService,
  ) {}

  async signUp(data: CreateUserBodyDto): Promise<ResponseBuilder<User>> {
    const result = await this.prismaService.$transaction(
      async (tx) => {
        const existingUser = await tx.user.findFirst({
          where: { email: data.email },
        });
        console.log('existingUser', existingUser);
        if (existingUser) {
          throw new ConflictException('User already exists with this email');
        }

        // Email verification for valid mail check

        // const emailVerificationData = await this.emailVerification.verifyEmail(
        //   data.email,
        // );

        // console.log(emailVerificationData);
        // throw new Error();

        data.password = await this.passwordManager.hashPassword(data.password);

        console.log('before user', dayjs().unix());
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

        console.log('before token', dayjs().unix());
        const token = this.jwtUtilsService.generateToken(tokenPayload);
        const refreshToken =
          this.jwtUtilsService.generateRefreshToken(tokenPayload);

        const otp = await this.otpService.createOtp(tx, { email: user.email });

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
      },
      { maxWait: 10000, timeout: 10000 },
    );
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

  async verifyUser(userId: string, otp: string) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (user.verified) {
      throw new ConflictException('User is already verified.');
    }

    const otpMatched = await this.otpService.verifyOtp(user.email, otp);
    if (!otpMatched) {
      throw new BadRequestException('Invalid otp.');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { verified: true },
    });

    const safeUser = getSafeUserInfo(updatedUser);
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
    const refreshToken = this.jwtUtilsService.generateRefreshToken(payload);

    const safeUser = getSafeUserInfo(user);

    // return { accessToken, refreshToken: newRefreshToken };
    return this.response
      .setToken(accessToken)
      .setRefreshToken(refreshToken)
      .setSessionExpierity(false)
      .setData(safeUser)
      .setMessage('Token refreshed.');
  }

  async sendOtp(data: SendOtpBodyDto) {
    const result = await this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: { email: data.email },
      });
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const otp = await this.otpService.createOtp(tx, { email: user.email });

      if (!otp) {
        throw new InternalServerErrorException('Failed to send otp.');
      }

      await this.emailService.sendGenericVerificationOtp(
        user.email,
        otp,
        user.name,
        'Reset password',
      );

      return this.response
        .setData(null)
        .setMessage('An OTP has been sent to the email.');
    });
    return result;
  }

  async verifyOtp(data: VerifyOtpBodyDto) {
    const user = await this.prismaService.user.findFirst({
      where: { email: data.email },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const otpMatched = await this.otpService.verifyOtp(user.email, data.otp);
    if (!otpMatched) {
      throw new BadRequestException('Invalid otp.');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      verified: user.verified,
      roles: [Role.User],
    };

    const otpToken = this.jwtUtilsService.generateOtpToken(payload);

    return this.response
      .setMessage('Otp validated.')
      .setOtpToken(otpToken)
      .setData(null);
  }

  async resetPass(data: ResetPassDataDto): Promise<ResponseBuilder<User>> {
    const user = await this.prismaService.user.findFirst({
      where: { id: data.userId },
    });
    if (!user) {
      throw new ConflictException('User not found');
    }

    data.password = await this.passwordManager.hashPassword(data.password);

    const updatedUser = await this.prismaService.user.update({
      where: { id: data.userId },
      data: { password: data.password, passwordChangedAt: new Date() },
    });
    if (!updatedUser) {
      throw new InternalServerErrorException('Failed to update user');
    }

    if (!updatedUser) {
      throw new InternalServerErrorException('Failed to reset pass.');
    }
    return this.response
      .setSessionExpierity(true)
      .setData(null)
      .setMessage('Password resetted. Please login again.');
    // return result;
  }
}
// async sendVerificationMail(data: { id: string; email: string }) {

// }
