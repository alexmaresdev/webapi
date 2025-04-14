import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction, TransactionContents } from './entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, TransactionContents])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
