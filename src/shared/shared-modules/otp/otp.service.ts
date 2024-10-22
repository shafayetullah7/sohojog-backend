import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as otpGenerator from 'otp-generator';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { Prisma, User } from '@prisma/client';
import { PasswordManagerService } from '../password-manager/password-manager.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly passManager: PasswordManagerService,
  ) {}

  async generateOtp(): Promise<string> {
    return otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    });
  }

  async createOtp(
    tx: Prisma.TransactionClient,
    userInfo: { email: string },
  ): Promise<string> {
    const otp = await this.generateOtp();
    const hashedOtp = await this.passManager.hashPassword(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    await tx.otp.upsert({
      where: {
        email: userInfo.email,
      },
      create: {
        otp: hashedOtp,
        expiresAt,
        email: userInfo.email,
      },
      update: {
        expiresAt,
        otp: hashedOtp,
        used: false,
      },
    });

    return otp;
  }

  // async sendOtp(user: Partial<User>): Promise<void> {
  //   // Use Prisma's transaction API to ensure both operations succeed or fail together
  //   await this.prisma.$transaction(async (prisma) => {
  //     try {
  //       if (!user.name) {
  //         throw new InternalServerErrorException('User name was not provided.');
  //       }
  //       if (!user.email) {
  //         throw new InternalServerErrorException(
  //           'User email was not provided.',
  //         );
  //       }
  //       const otp = await this.generateOtp();
  //       const hashedOtp = await this.passManager.hashPassword(otp);
  //       const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  //       // Save OTP to database
  //       await prisma.otp.create({
  //         data: {
  //           email: user.email,
  //           otp: hashedOtp,
  //           expiresAt,
  //         },
  //       });

  //       // Send OTP email
  //       await this.emailService.sendWelcomeVerificationOtp(
  //         user.email,
  //         otp,
  //         user.name,
  //       );
  //     } catch (error) {
  //       // Handle error (log it, rethrow, etc.)
  //       console.error('Error sending OTP:', error);
  //       throw error;
  //     } finally {
  //       await this.prisma.$disconnect(); // Close Prisma client connection
  //     }
  //   });
  // }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const otpRecord = await this.prisma.otp.findUnique({
      where: { email },
    });

    if (!otpRecord || otpRecord.used || otpRecord.expiresAt < new Date()) {
      return false;
    }

    // console.log(email, otpRecord, otp);
    const isMatch = await this.passManager.matchPassword(otp, otpRecord.otp);

    if (!isMatch) {
      return isMatch;
    }
    // console.log('is match', isMatch);

    await this.prisma.otp.update({
      where: { email },
      data: { used: true },
    });

    return isMatch;
  }
}
