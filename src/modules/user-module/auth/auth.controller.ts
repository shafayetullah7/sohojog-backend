import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Redirect,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import { CreateUserBodyDto, createUserBodySchema } from './dto/create.user.dto';
import { LoginUserBodyDto, loginUserBodySchema } from './dto/login.user.dto';
import { GoogleAuthGuard } from 'src/shared/guards/google-auth/google-auth.guard';
import { LocalAuthService } from './services/local/local.auth.service';
import { Request, Response } from 'express';
import { GoogleAuthService } from './services/google/google.auth.service';
import { GenericUser } from 'src/constants/interfaces/req-user/generic.user';
import { JwtUtilsService } from 'src/modules/common/jwt/jwt-utils.service';
import { JwtRefreshGuard } from 'src/shared/guards/jwt.refresh.gaurd';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import {
  VerifynUserBodyDto,
  verifyUserBodySchema,
} from './dto/verify.user.dto';
import { SendOtpBodyDto, sendOtpBodySchema } from './dto/send.otp.dto';
import { VerifyOtpBodyDto } from './dto/verify.otp.dto';
import { OtpGuard } from 'src/shared/guards/jwt.otp.guard';
import { ResetPassBodyDto, resetPassBodySchema } from './dto/reset.pass.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly jwtUtilsService: JwtUtilsService,
  ) {}

  @Post('sign-up')
  @HttpCode(201)
  // @ZodValidation(createUserBodySchema)
  async signUpUser(
    @Body(ZodValidation(createUserBodySchema)) data: CreateUserBodyDto,
  ) {
    const result = await this.localAuthService.signUp(data);
    return result;
  }

  @HttpCode(200)
  @Post('login')
  // @ZodValidation(loginUserBodySchema)
  async login(
    @Body(ZodValidation(loginUserBodySchema)) data: LoginUserBodyDto,
  ) {
    const result = await this.localAuthService.login(data);

    return result;
  }

  @HttpCode(200)
  @Post('verify')
  @UseGuards(JwtAuthGaurd, RolesGuard)
  @Roles(Role.User)
  // @ZodValidation(verifyUserBodySchema)
  async verifyUser(
    @Body(ZodValidation(verifyUserBodySchema)) data: VerifynUserBodyDto,
    @Req() req: Request,
  ) {
    const { user } = req;
    if (!user?.userId) {
      throw new UnauthorizedException('Unauthorized access.');
    }
    const result = await this.localAuthService.verifyUser(
      user.userId,
      data.otp,
    );
    return result;
  }

  @HttpCode(200)
  @Post('send-otp')
  async sendOtp(@Body(ZodValidation(sendOtpBodySchema)) data: SendOtpBodyDto) {
    const result = await this.localAuthService.sendOtp(data);
    return result;
  }

  @HttpCode(200)
  @Post('verify-otp')
  async verifyOtp(
    @Body(ZodValidation(verifyUserBodySchema)) data: VerifyOtpBodyDto,
  ) {
    const result = await this.localAuthService.verifyOtp(data);
  }

  @HttpCode(200)
  @Post('reset-password')
  @UseGuards(OtpGuard)
  async resetPassword(
    @Body(ZodValidation(resetPassBodySchema)) data: ResetPassBodyDto,
    @Req() req: Request,
  ) {
    const { user } = req;
    if (!user) {
      throw new UnauthorizedException('Use');
    }

    const result = await this.localAuthService.resetPass({
      ...data,
      userId: user.userId,
    });

    return result;
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const { user } = req;
    if (!user) {
      throw new UnauthorizedException('Failed to login');
    }

    const payload: GenericUser = {
      email: user.email,
      userId: user.userId,
      roles: user.roles,
      verified: user.verified,
    };

    const token = this.jwtUtilsService.generateToken(payload);

    // const result = await this.googleAuthService.loginWithGoogle(payload);
    // res.cookie('secureToken', token, {
    //   maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'none',
    // });
    // res.redirect(`http://www.abc12345321.com?token=${token}`);
    res.json({});
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Unauthorized.');
    }
    const result = await this.localAuthService.refreshToken(user.userId);

    return result;
  }

  @Get()
  check(@Req() req: Request, @Res() res: Response) {
    // return { url: 'https://www.google.co.uk/' };
    console.log(req.cookies);

    res.cookie('secureToken', 'Lkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', {
      maxAge: 1000 * 20, // 7 days
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    // res.redirect(`http://www.abc12345321.com?token=${token}`);
    return res.json({});
  }
}
