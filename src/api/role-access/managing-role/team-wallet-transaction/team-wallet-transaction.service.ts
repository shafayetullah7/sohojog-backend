import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { managerTeamWalletHelper } from 'src/_helpers/access-helpers/manager-access/manager.team.wallet.helper';
import { TransactionType } from '@prisma/client';
import { CreateTeamWalletTransactionDto } from './dto/create-team-wallet-transaction.dto';

@Injectable()
export class TeamWalletTransactionService {
  constructor(private readonly prisma: PrismaService) {}

  // Credit operation: Deduct from project wallet and add to team wallet
  async creditTeamWallet(
    userId: string,
    teamWalletId: string,
    creditDebitDto: CreateTeamWalletTransactionDto,
  ) {
    const { amount, description } = creditDebitDto;

    const managerTeamWallet =
      await managerTeamWalletHelper.getManagerTeamWallet(
        this.prisma,
        userId,
        teamWalletId,
      );

    if (!managerTeamWallet) {
      throw new NotFoundException('Team Wallet not found');
    }
    const { teamWallet, project, projectWallets, manager, team } =
      managerTeamWallet;
    const projectId = project.id;

    if (!projectWallets.length) {
      throw new NotFoundException('Project Wallet not found');
    }
    const [projectWallet] = projectWallets;

    if (projectWallet.balance < amount) {
      throw new BadRequestException('Insufficient funds in the project wallet');
    }

    const updatedTeamWallet = await this.prisma.$transaction(async (tx) => {
      const updatedProjectWallet = await tx.wallet.update({
        where: { id: projectWallet.id },
        data: {
          balance: { decrement: amount },
        },
      });

      // Credit team wallet
      const updatedTeamWallet = await tx.teamWallet.update({
        where: { id: teamWalletId },
        data: {
          balance: { increment: amount },
        },
      });

      const walletTransaction = await tx.walletTransaction.create({
        data: {
          walletId: projectWallet.id,
          amount,
          transactionType: TransactionType.DEBIT,
          description:
            description ||
            `Debit from project wallet for team:${team.name} wallet.`,
          transactionById: userId,
        },
      });

      await tx.teamTransaction.create({
        data: {
          teamWalletId,
          projectWalletTransactionId: walletTransaction.id,
          amount,
          transactionType: TransactionType.CREDIT,
          description: description || `Credit to team:${team.name} wallet.`,
        },
      });

      return updatedTeamWallet;
    });

    return updatedTeamWallet;
  }

  async debitTeamWallet(
    userId: string,
    teamWalletId: string,
    creditDebitDto: CreateTeamWalletTransactionDto,
  ) {
    const { amount, description } = creditDebitDto;

    // Validate that the team wallet exists
    const managerTeamWallet =
      await managerTeamWalletHelper.getManagerTeamWallet(
        this.prisma,
        userId,
        teamWalletId,
      );

    if (!managerTeamWallet) {
      throw new NotFoundException('Team Wallet not found');
    }

    const { teamWallet, project, projectWallets, manager, team } =
      managerTeamWallet;
    const projectId = project.id;

    if (!projectWallets.length) {
      throw new NotFoundException('Project Wallet not found');
    }

    const [projectWallet] = projectWallets;

    if (teamWallet.balance < amount) {
      throw new BadRequestException('Insufficient funds in the team wallet');
    }

    const updatedTeamWallet = await this.prisma.$transaction(async (tx) => {
      const updatedTeamWallet = await tx.teamWallet.update({
        where: { id: teamWalletId },
        data: {
          balance: { decrement: amount },
        },
      });

      const updatedProjectWallet = await tx.wallet.update({
        where: { id: projectWallet.id },
        data: {
          balance: { increment: amount },
        },
      });

      // Record transaction for team wallet

      // Record transaction for project wallet
      const walletTransaction = await tx.walletTransaction.create({
        data: {
          walletId: projectWallet.id,
          amount,
          transactionType: TransactionType.CREDIT,
          description:
            description ||
            `Credit back to project wallet from team wallet ${teamWalletId}`,
          transactionById: userId,
        },
      });

      await tx.teamTransaction.create({
        data: {
          teamWalletId,
          projectWalletTransactionId: walletTransaction.id,
          amount,
          transactionType: TransactionType.DEBIT,
          description:
            description || `Debit from team wallet by user ${userId}`,
        },
      });

      return updatedTeamWallet;
    });

    return updatedTeamWallet;
  }
}
