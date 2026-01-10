import { ID, Timestamp } from '../../shared/types';

export interface Subscription {
  id: ID;
  userId: ID;
  tier: string;
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PENDING';
  expiresAt?: Timestamp;
}

export interface Ticket {
  id: ID;
  userId: ID;
  type: string; // e.g., feature credit
  balance: number;
}

export interface PaymentTransaction {
  id: ID;
  userId: ID;
  provider: string; // e.g., ORANGE_MONEY
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  reference?: string;
  createdAt: Timestamp;
}
