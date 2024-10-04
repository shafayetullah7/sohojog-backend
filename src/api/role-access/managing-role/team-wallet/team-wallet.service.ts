import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamWalletDto } from './dto/create.team.wallet.dto';
import { managerTeamHelper } from 'src/_helpers/access-helpers/manager-access/manager.team.helper';
import { UpdateWalletStatusBodyDto } from './dto/update.team.wallet.status';
import { managerTeamWalletHelper } from 'src/_helpers/access-helpers/manager-access/manager.team.wallet.helper';

@Injectable()
export class TeamWalletService {
  constructor(private readonly prisma: PrismaService) {}

  async createTeamWallet(userId: string, payload: CreateTeamWalletDto) {
    const managerTeam = await managerTeamHelper.getManagerTeam(
      this.prisma,
      userId,
      payload.teamId,
    );

    if (!managerTeam) {
      throw new NotFoundException('Team not found.');
    }

    const existingTeamWallet = await this.prisma.teamWallet.findUnique({
      where: { teamId: payload.teamId },
    });

    if (existingTeamWallet) {
      throw new BadRequestException('A wallet for this team already exists');
    }

    const newTeamWallet = await this.prisma.teamWallet.create({
      data: payload,
    });

    return newTeamWallet;
  }

  async updateTeamWalletStatus(
    userId: string,
    teamWalletId: string,
    updateWalletStatusDto: UpdateWalletStatusBodyDto,
  ) {
    const { status } = updateWalletStatusDto;

    const teamWallet = await managerTeamWalletHelper.getManagerTeamWallet(
      this.prisma,
      userId,
      teamWalletId,
    );

    if (!teamWallet) {
      throw new NotFoundException('Team Wallet not found');
    }

    const updatedTeamWallet = await this.prisma.teamWallet.update({
      where: { id: teamWalletId },
      data: {
        status,
      },
    });

    return updatedTeamWallet;
  }
}
