
export type SpendingCategory = 'Tedarikçi' | 'Vergi/Resmi Harç' | 'Personel' | 'Lojistik/Ulaşım' | 'Ofis/Kira' | 'Pazarlama' | 'Yazılım/SaaS' | 'Diğer';

export interface Firm {
  id: string;
  name: string;
  totalDebt: number; // Firmaya olan toplam borç
}

export interface CreditCard {
  id: string;
  cardName: string;
  bank: string;
  totalLimit: number;
  usedAmount: number;
  dueDay: number;
  statementDay: number;
}

export type NewCard = Omit<CreditCard, 'id'>;

export interface Transaction {
  id: string;
  cardId?: string; // Kredi kartı ile yapıldıysa
  firmId?: string; // Bir firmaya yapıldıysa
  amount: number;
  description: string;
  date: string;
  type: 'spending' | 'payment' | 'firm_settlement'; // firm_settlement: Firmaya yapılan ödeme
  category?: SpendingCategory;
}

export interface Budget {
  category: SpendingCategory;
  limit: number;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  category: SpendingCategory;
  cardId: string;
  billingDay: number;
}

export interface CardStats {
  totalLimit: number;
  totalUsed: number;
  totalRemaining: number;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}
