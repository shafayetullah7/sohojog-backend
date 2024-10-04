import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectWalletTransactionDto } from './dto/create.project.wallet.transaction';
import { managerWalletHelper } from 'src/_helpers/access-helpers/manager-access/manager.wallet.helper';
import { TransactionType } from '@prisma/client';

@Injectable()
export class ProjectWalletTransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async creditWallet(userId: string, data: CreateProjectWalletTransactionDto) {
    const { walletId, amount, description } = data;

    const managerWallet = await managerWalletHelper.getManagerWallet(
      this.prisma,
      userId,
      walletId,
    );

    if (!managerWallet) {
      throw new Error('Wallet not found');
    }

    const newBalance = managerWallet.wallet.balance + amount;

    const [updatedWallet, walletTransaction] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId,
          amount,
          transactionType: TransactionType.CREDIT,
          transactionById: managerWallet.manager.adminRole[0].id,
          description,
        },
      }),
    ]);
    return { wallet: updatedWallet, transaction: walletTransaction };
  }

  async debitWallet(userId: string, data: CreateProjectWalletTransactionDto) {
    const { walletId, amount, description } = data;

    const managerWallet = await managerWalletHelper.getManagerWallet(
      this.prisma,
      userId,
      walletId,
    );

    if (!managerWallet) {
      throw new Error('Wallet not found');
    }

    const newBalance = managerWallet.wallet.balance - amount;

    if (newBalance < 0) {
      throw new Error('Insufficient balance for debit transaction');
    }

    const [updatedWallet, walletTransaction] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId,
          amount,
          transactionType: TransactionType.DEBIT,
          transactionById: managerWallet.manager.adminRole[0].id,
          description,
        },
      }),
    ]);

    return { wallet: updatedWallet, transaction: walletTransaction };
  }
}
