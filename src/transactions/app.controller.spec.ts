import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '../prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, PrismaService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService  = app.get<AppService>(AppService);
  });

  describe('root', () => {
    enum PaymentMethod {
      DebitCard = 'debit_card',
      CreditCard = 'credit_card',
    }

    const transactionData = {
      amount: 100,
      description: 'test',
      paymentMethod: PaymentMethod.DebitCard,
      cardNumber: '123465432657',
      cardExpiringDate: '12/2026',
      cvv: '123',
    }

    const returnedTransaction = {
      id: '1',
      amount: 100,
      description: 'test',
      paymentMethod: PaymentMethod.DebitCard,
      cardNumber: '432657',
      cardExpiringDate: '12/2026',
      cvv: '123',
      date: new Date(),
    }

    const returnedPayable = {
      id: '1',
      amount: 97,
      status: 'paid',
      payment_date: new Date(),
    }

    it('should return transaction and payable', async () => {

      appService.prisma.transaction.create = jest.fn().mockResolvedValue(returnedTransaction);
      appService.prisma.payable.create = jest.fn().mockResolvedValue(returnedPayable);

      const transaction = await appController.createTransaction(transactionData);
      expect(transaction).toMatchObject({
        transaction: returnedTransaction,
        payable: returnedPayable,
      });
    });

    it('should return transactions', async () => {
      const transactions = [transactionData]

      appService.prisma.transaction.findMany = jest.fn().mockResolvedValue(transactions);

      const returnedTransactions = await appController.getTransactions();
      expect(returnedTransactions).toEqual(transactions);
    });

    it('should return expiry card error"', async () => {
      try{
        const transaction = await appController.createTransaction({...transactionData, cardExpiringDate: '12/2019'});
      } catch (error) {
        expect(error?.message).toEqual('Card is expired');
      }
    });

    it('should return amount', async () => {
      const payables = [
        returnedPayable,
        { ...returnedPayable, amount: 50, status: 'waiting_funds' },
      ]

      appService.prisma.payable.findMany = jest.fn().mockResolvedValue(payables);

      const amount = await appController.getAmount();
      expect(amount).toMatchObject({
        availableAmount: "97.00",
        waiting_funds: "50.00",
      });
    });

    it('should return amount card number error', async () => {
      try{
        const transaction = await appController.createTransaction({...transactionData, cardNumber: '123'});
      } catch (error) {
        expect(error?.message).toEqual('Validation failed (length must be longer than or equal to 13 characters)');
      }
    });
  });
});
