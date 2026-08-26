import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecurringExpense } from '../models/recurring-expense';

@Injectable({
  providedIn: 'root'
})
export class RecurringExpenseService {

  private api = 'http://localhost:8080/recurring-expenses';

  constructor(private http: HttpClient) {}

  getRecurringExpenses(): Observable<RecurringExpense[]> {
    return this.http.get<RecurringExpense[]>(this.api);
  }

  createRecurringExpense(
    expense: RecurringExpense
  ): Observable<RecurringExpense> {

    return this.http.post<RecurringExpense>(
      this.api,
      {
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        frequency: expense.frequency,
        startDate: expense.startDate,
        endDate: expense.endDate || null
      }
    );
  }

  deleteRecurringExpense(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.api}/${id}`
    );
  }

  toggleRecurringExpense(
    id: number
  ): Observable<RecurringExpense> {

    return this.http.put<RecurringExpense>(
      `${this.api}/${id}/toggle`,
      {}
    );
  }
}