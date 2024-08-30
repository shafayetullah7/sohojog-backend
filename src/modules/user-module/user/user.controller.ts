import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, createUserSchema } from './dto/create.user.dto';
// import { Request } from 'express';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import { Request } from 'express';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Version('1')
  @Post()
  // @ZodValidation(createUserSchema)
  createUser(
    @Body(ZodValidation(createUserSchema)) createUserDto: CreateUserDto,
  ) {
    const result = this.userService.createUser(createUserDto);
    return result;
  }

  @Get()
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  @Roles(Role.User)
  getProfile(@Req() request: Request) {
    return { user: request.user };
  }
}
