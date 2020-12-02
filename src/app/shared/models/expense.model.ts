import { User } from './user.model';

export interface Expense{
    owner: User;
    uids: string[];
    amount: number;
    type: string;
    desc: string;
    date: Date;
    gid: string;
}