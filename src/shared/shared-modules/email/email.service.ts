import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { getWelcomeOtpTemplate } from './email-templates/verify.newuser.template';
import { EnvConfigService } from 'src/env-config/env.config.service';
import { getGenericVerificationTemplate } from './email-templates/send.otp.template';
import { getProjectInvitationTemplate } from './email-templates/send.invitation.template';
import { SendProjectInvitationDto } from './dto/send.invitation.dto';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private envConfig: EnvConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.envConfig.emailHost,
      port: this.envConfig.emailPort,
      secure: this.envConfig.emailPort === 465, // true for 465, false for other ports
      auth: {
        user: this.envConfig.emailUser,
        pass: this.envConfig.emailPass,
      },
    });
  }

  async sendWelcomeVerificationOtp(
    email: string,
    otp: string,
    userName: string,
  ) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Sohojog" <${this.envConfig.emailUser}>`,
        to: email,
        subject: 'Your OTP Code',
        html: getWelcomeOtpTemplate({ userName, otp }),
      });

      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendGenericVerificationOtp(
    email: string,
    otp: string,
    userName: string,
    purpose: string,
  ) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Sohojog" <${this.envConfig.emailUser}>`,
        to: email,
        subject: 'Your OTP Code',
        html: getGenericVerificationTemplate({
          userName,
          otp,
          verificationPurpose: purpose,
        }),
      });

      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendProjectInvitationEmail(data: SendProjectInvitationDto) {
    try {
      const { email, ...rest } = data;
      const info = await this.transporter.sendMail({
        from: `"Sohojog" <${this.envConfig.emailUser}>`,
        to: email,
        subject: `Invitation to '${data.projectName}'`,
        html: getProjectInvitationTemplate(rest),
      });

      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
