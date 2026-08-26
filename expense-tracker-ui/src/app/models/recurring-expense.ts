export interface RecurringExpense {
  id?: number;
  title: string;
  amount: number;
  category: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  nextRunDate?: string;
  endDate?: string;
  active?: boolean;
}