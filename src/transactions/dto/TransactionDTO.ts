export class TransactionDTO {
    id?: string;
    amount: number;
    description: string;
    paymentMethod: 'debit_card' | 'credit_card';
    cardNumber: string;
    cardExpiringDate: Date;
    cvv: string;
}