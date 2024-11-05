import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';
import {
  getSafeUserInfo,
  SafeUserInfo,
} from 'src/shared/utils/filters/safe.user.info.filter';
import { Image, User } from '@prisma/client';
import { UpdateUserDto } from './dto/user.update.dto';
import { CloudinaryService } from 'src/shared/shared-modules/file/cloudinary.service';
import { FileService } from 'src/shared/shared-modules/file/file.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly response: ResponseBuilder<any>,
    private readonly fileService: FileService,
  ) {}
  createUser(data: CreateUserDto) {
    return data;
  }

  async findUserByEmail(email: string) {
    const user = await this.prismaService.user.findFirst({ where: { email } });
    return user;
  }

  async findUserById(id: string) {
    const user = await this.prismaService.user.findFirst({ where: { id } });
    return user;
  }

  async getMe(id: string): Promise<ResponseBuilder<SafeUserInfo>> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: { profilePicture: true },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const safeUser = getSafeUserInfo(user);

    return this.response
      .setSuccess(true)
      .setData({ user: safeUser })
      .setMessage('User retreived.');
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    // Check if the user exists
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update only the name
    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { name: updateUserDto.name },
      include: {
        profilePicture: true,
      },
    });
    const safeUser = getSafeUserInfo(updatedUser);

    return this.response
      .setSuccess(true)
      .setMessage('User updated successfully')
      .setData(safeUser);
  }

  async updateProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<ResponseBuilder<{ user: SafeUserInfo }>> {
    return this.prismaService.$transaction(
      async (transaction) => {
        const user = await transaction.user.findUnique({
          where: { id: userId },
        });
        if (!user) {
          throw new NotFoundException('User not found.');
        }

        // Store the previous profile picture ID to delete later if the update succeeds
        const previousProfilePictureId = user.profilePictureId;

        // Step 2: Upload the new profile picture to Cloudinary
        let uploadResult: Image;

        try {
          uploadResult = await this.fileService.uploadSingleImageAndInsert(
            file,
            userId,
            transaction,
          );
        } catch (error) {
          console.log('error', error);
          throw new InternalServerErrorException(
            'Failed to upload new profile picture.',
          );
        }

        console.log('****************', uploadResult);

        try {
          // Step 3: Update the user's profile picture in the database
          const updatedUser = await transaction.user.update({
            where: { id: userId },
            data: {
              profilePictureId: uploadResult.id,
            },
            include: {
              profilePicture: true,
            },
          });

          // If database update succeeds, delete the previous profile picture from Cloudinary
          if (previousProfilePictureId) {
            await this.fileService.deleteImagesAndRecord(
              previousProfilePictureId,
              transaction,
            );
          }

          // Return the new profile picture URL
          return this.response
            .setSuccess(true)
            .setMessage('Profile picture updated successfully.')
            .setData({ user: getSafeUserInfo(updatedUser) });
        } catch (error) {
          console.log(error);

          // If database update fails, delete the newly uploaded file to avoid orphaned files
          await this.fileService.deleteImagesAndRecord(
            uploadResult.id,
            transaction,
          );
          throw new InternalServerErrorException(
            'Failed to update profile picture.',
          );
        }
      },
      { timeout: 15000 },
    );
  }
}
