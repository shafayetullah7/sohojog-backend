import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamWalletTransactionDto } from './create-team-wallet-transaction.dto';

export class UpdateTeamWalletTransactionDto extends PartialType(CreateTeamWalletTransactionDto) {}
