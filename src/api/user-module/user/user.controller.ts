import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
import { UpdateUserDto, updateUserSchema } from './dto/user.update.dto';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { FileHandler } from 'src/shared/shared-modules/file/file.handler';

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

  @Get('get-me')
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  @Roles(Role.User)
  async getMe(@Req() req: Request) {
    const { user } = req;

    if (!user) {
      throw new NotFoundException('Unauthorized.');
    }

    const result = await this.userService.getMe(user.userId);
    return result;
  }

  @Patch()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async updateUser(
    @Body(ZodValidation(updateUserSchema)) body: UpdateUserDto,
    @User() user: JwtUser,
  ) {
    const updatedUser = await this.userService.updateUser(user.userId, body);

    return updatedUser;
  }

  @Patch('/profile-picture')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  @UseInterceptors(
    FileHandler.generateFileInterceptor('profile', [
      'jpeg',
      'jpg',
      'png',
      'webp',
    ]),
  )
  async updateProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @User() user: JwtUser,
  ) {
    const result = await this.userService.updateProfilePicture(
      user.userId,
      file,
    );

    return result;
  }
}
