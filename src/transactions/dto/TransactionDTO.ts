import { IsIn, IsNotEmpty, IsPositive, Length } from "class-validator";

export class TransactionDTO {
    id?: string;

    @IsNotEmpty()
    @IsPositive()
    amount: number;

    description: string;

    @IsIn(['debit_card', 'credit_card'])
    paymentMethod: 'debit_card' | 'credit_card';

    @IsNotEmpty()
    @Length(13, 16)
    cardNumber: string;

    @IsNotEmpty()
    cardExpiringDate: Date;

    @IsNotEmpty()
    cvv: string;
}