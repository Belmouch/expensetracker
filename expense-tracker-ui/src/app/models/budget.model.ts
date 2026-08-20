export interface Budget {
  id: number;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  category: string;
  startDate: string;
  endDate: string;
  userId: number;
}

export interface BudgetRequest {
  amount: number;
  category: string;
  startDate: string;
  endDate: string;
}