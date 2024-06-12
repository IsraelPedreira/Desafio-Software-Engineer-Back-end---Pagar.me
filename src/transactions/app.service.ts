import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TransactionDTO } from './dto/TransactionDTO';
import { PayableDTO } from './dto/PayableDTO';

@Injectable()
export class AppService {
  constructor(public prisma: PrismaService) {}

  async createTransaction(body: TransactionDTO): Promise<TransactionDTO> {
    //save just 4 digits of the card number
    const cardNumber = body.cardNumber.slice(-4);

    //handle card expiration date
    const cardExpiringDateBody = body.cardExpiringDate.split('/');
    if (body.cardExpiringDate.length !== 7) {
      throw new Error('Invalid card expiration date format');
    }

    const month = cardExpiringDateBody[0];
    const year = cardExpiringDateBody[1];
    const cardExpirationDate = new Date(parseInt(year), parseInt(month) - 1);

    //check if the card is expired
    if (cardExpirationDate < new Date()) {
      throw new Error('Card is expired');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        amount: Number(body.amount.toFixed(2)),
        description: body.description,
        paymentMethod: body.paymentMethod,
        cardNumber: cardNumber,
        cardExpiringDate: body.cardExpiringDate,
        cvv: body.cvv,
        date: new Date(),
      },
    });
    return transaction;
  }

  async getTransactions(): Promise<TransactionDTO[]> {
    return this.prisma.transaction.findMany();
  }

  async createPayable(transaction: TransactionDTO): Promise<PayableDTO> {
    //calculate fees
    let amount: number = transaction.amount;
    let status: string;
    let payment_date: Date;

    if (transaction.paymentMethod === 'debit_card') {
      amount -= amount * 0.03;
      status = 'paid';
      payment_date = new Date();
    }

    if (transaction.paymentMethod === 'credit_card') {
      amount -= amount * 0.05;
      status = 'waiting_funds';
      payment_date = new Date();
      payment_date.setDate(payment_date.getDate() + 30);
    }

    const payable = await this.prisma.payable.create({
      data: {
        amount: Number(amount.toFixed(2)),
        status: status,
        payment_date: payment_date,
        transaction: {
          connect: {
            id: transaction.id,
          },
        },
      },
    });

    return payable;
  }

  async getAmount(): Promise<any> {
    const payables = await this.prisma.payable.findMany();
    let availableAmount: number = 0;
    let waitingAmount: number = 0;

    payables.forEach((payable) => {
      if (payable.status === 'paid') {
        availableAmount += payable.amount;
      }

      if (payable.status === 'waiting_funds') {
        waitingAmount += payable.amount;
      }
    });
    const amount = {
      availableAmount: availableAmount.toFixed(2),
      waiting_funds: waitingAmount.toFixed(2),
    };

    return amount;
  }
}
