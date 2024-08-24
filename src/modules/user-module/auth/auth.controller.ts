import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Redirect,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import { CreateUserBodyDto, createUserBodySchema } from './dto/create.user.dto';
import { LoginUserBodyDto, loginUserBodySchema } from './dto/login.user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @HttpCode(201)
  @ZodValidation(createUserBodySchema)
  async signUpUser(@Body() data: CreateUserBodyDto) {
    const result = await this.authService.signUp(data);
    return result;
  }

  @HttpCode(200)
  @Post('login')
  @ZodValidation(loginUserBodySchema)
  async login(@Body() data: LoginUserBodyDto) {
    const result = await this.authService.login(data);

    // const res = new ResponseBuilder().setData(result).setMessage('Logged in.');
    // return res;
    return result;
    // return req.user;
  }

  @Get()
  @Redirect('https://www.google.co.uk/')
  check() {
    return { url: 'https://www.google.co.uk/' };
  }
}
