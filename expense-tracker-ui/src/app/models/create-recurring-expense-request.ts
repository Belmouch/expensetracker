export interface CreateRecurringExpenseRequest {

  title: string;

  amount: number;

  category: string;

  frequency: string;

  startDate: string;

  endDate: string;
}