export interface Contribution {
  id: string;
  date: string;
  donor: string;
  fund: string;
  amount: number;
  method: 'card' | 'mobile-money' | 'cash' | 'transfer';
  recurring: boolean;
}

export interface Fund {
  label: string;
  amount: number;
  share: number;
}
