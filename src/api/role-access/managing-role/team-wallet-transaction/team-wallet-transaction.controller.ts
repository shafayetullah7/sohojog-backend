import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TeamWalletTransactionService } from './team-wallet-transaction.service';
import { CreateTeamWalletTransactionDto } from './dto/create-team-wallet-transaction.dto';
import { UpdateTeamWalletTransactionDto } from './dto/update-team-wallet-transaction.dto';

@Controller('team-wallet-transaction')
export class TeamWalletTransactionController {
  constructor(private readonly teamWalletTransactionService: TeamWalletTransactionService) {}

  @Post()
  create(@Body() createTeamWalletTransactionDto: CreateTeamWalletTransactionDto) {
    return this.teamWalletTransactionService.create(createTeamWalletTransactionDto);
  }

  @Get()
  findAll() {
    return this.teamWalletTransactionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamWalletTransactionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeamWalletTransactionDto: UpdateTeamWalletTransactionDto) {
    return this.teamWalletTransactionService.update(+id, updateTeamWalletTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamWalletTransactionService.remove(+id);
  }
}
