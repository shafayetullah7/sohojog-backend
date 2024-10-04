import { Injectable } from '@nestjs/common';
import { CreateTeamWalletTransactionDto } from './dto/create-team-wallet-transaction.dto';
import { UpdateTeamWalletTransactionDto } from './dto/update-team-wallet-transaction.dto';

@Injectable()
export class TeamWalletTransactionService {
  create(createTeamWalletTransactionDto: CreateTeamWalletTransactionDto) {
    return 'This action adds a new teamWalletTransaction';
  }

  findAll() {
    return `This action returns all teamWalletTransaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} teamWalletTransaction`;
  }

  update(id: number, updateTeamWalletTransactionDto: UpdateTeamWalletTransactionDto) {
    return `This action updates a #${id} teamWalletTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} teamWalletTransaction`;
  }
}
