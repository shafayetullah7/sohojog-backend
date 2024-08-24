import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { getWelcomeOtpTemplate } from './email.templates';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail', // You can use other services like 'SendGrid', 'Mailgun', etc.
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });
  }

  async sendWelcomeVerificationOtp(
    email: string,
    otp: string,
    userName: string,
  ) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      html: getWelcomeOtpTemplate({ userName, otp }),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
