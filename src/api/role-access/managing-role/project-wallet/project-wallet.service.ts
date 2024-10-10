import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectWalletDto } from './dto/create.project.wallet';
import { managerProjectHelper } from 'src/_helpers/access-helpers/manager-access/manager.project.helper';
import { managerWalletHelper } from 'src/_helpers/access-helpers/manager-access/manager.wallet.helper';
import { ResponseBuilder } from 'src/shared/modules/response-builder/response.builder';
import { Wallet } from '@prisma/client';
import { UpdateProjectWalletBodyDto } from './dto/update.project.wallet';

@Injectable()
export class ProjectWalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseBuilder<any>,
  ) {}

  async createWallet(
    userId: string,
    CreateProjectWalletDto: CreateProjectWalletDto,
  ): Promise<ResponseBuilder<{ walles: Wallet }>> {
    const { projectId, balance, currency, status } = CreateProjectWalletDto;

    const managerProject = await managerProjectHelper.getManagerProject(
      this.prisma,
      userId,
      projectId,
    );

    if (!managerProject) {
      throw new BadRequestException('Project not found');
    }

    const existingWallet = await this.prisma.wallet.findUnique({
      where: { projectId },
    });

    if (existingWallet) {
      throw new BadRequestException('A wallet for this project already exists');
    }

    const wallet = await this.prisma.wallet.create({
      data: {
        balance,
        currency,
        status,
        projectId,
      },
    });

    return this.response
      .setSuccess(true)
      .setMessage('Project wallet created successfully.')
      .setData({ wallet });
  }

  async updateWalletStatus(
    userId: string,
    walletId: string,
    updateWalletStatusDto: UpdateProjectWalletBodyDto,
  ): Promise<ResponseBuilder<{ wallet: Wallet }>> {
    const { status } = updateWalletStatusDto;

    const managerWallet = await managerWalletHelper.getManagerWallet(
      this.prisma,
      userId,
      walletId,
    );

    if (!managerWallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Update the wallet's status
    const updatedWallet = await this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        status,
      },
    });

    return this.response
      .setSuccess(true)
      .setMessage('Project wallet updated')
      .setData({ wallet: updatedWallet });
  }

  // Method to get wallet by ID
  async getWalletById(walletId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }
}
