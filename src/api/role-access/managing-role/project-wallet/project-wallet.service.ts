import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectWalletDto } from './dto/create.project.wallet';
import { managerProjectHelper } from 'src/_helpers/access-helpers/manager-access/manager.project.helper';
import { UpdateWalletStatusBodyDto } from './dto/update.project.wallet.status';
import { managerWalletHelper } from 'src/_helpers/access-helpers/manager-access/manager.wallet.helper';

@Injectable()
export class ProjectWalletService {
  constructor(private readonly prisma: PrismaService) {}

  async createWallet(
    userId: string,
    CreateProjectWalletDto: CreateProjectWalletDto,
  ) {
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

    return wallet;
  }

  async updateWalletStatus(
    userId: string,
    walletId: string,
    updateWalletStatusDto: UpdateWalletStatusBodyDto,
  ) {
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

    return updatedWallet;
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
