import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { TransactionDTO } from './dto/TransactionDTO';

@Controller('/transactions')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async createTransaction(@Body() body: TransactionDTO): Promise<any> {
    const transaction = await this.appService.createTransaction(body);
    const payable = await this.appService.createPayable(transaction);

    const response = {
      transaction,
      payable,
    };
    return response;
  }

  @Get()
  async getTransactions(): Promise<TransactionDTO[]> {
    return await this.appService.getTransactions();
  }

  @Get('/amount')
  async getAmount() {
    const amount = await this.appService.getAmount();
    return amount;
  }
}
