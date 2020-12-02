export interface Expense{
    owner: string;
    uids: string[];
    amount: number;
    type: string;
    desc: string;
    date: Date
}