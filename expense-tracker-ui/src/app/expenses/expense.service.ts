import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MonthlyStatistics } from '../models/monthly-statistics';
import { Expense } from '../models/expense';
import { PageResponse } from '../models/page-response';
import { CreateExpenseRequest } from '../models/create-expense-request';
import { ExpenseStatisticsResponse } from '../models/expense-statistics-response';
@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private api = 'http://localhost:8080/expenses';

  constructor(private http: HttpClient) {}

  // =========================
  // GET EXPENSES
  // =========================

 getExpenses(
  page: number,
  size: number,
  search?: string,
  fromDate?: string,
  toDate?: string
): Observable<PageResponse<Expense>> {

  let params = new HttpParams()
    .set('page', page)
    .set('size', size)
    .set('sortBy', 'date')
    .set('direction', 'desc');

  if (search && search.trim()) {
    params = params.set('search', search.trim());
  }

  if (fromDate) {
    params = params.set('fromDate', fromDate);
  }

  if (toDate) {
    params = params.set('toDate', toDate);
  }

  return this.http.get<PageResponse<Expense>>(
    this.api,
    { params }
  );
}

  // =========================
  // GET BY ID
  // =========================

  getExpenseById(id: number): Observable<Expense> {

    return this.http.get<Expense>(
      `${this.api}/${id}`
    );
  }

  // =========================
  // SAVE
  // =========================

  saveExpense(
    request: CreateExpenseRequest
  ): Observable<Expense> {

    return this.http.post<Expense>(
      this.api,
      request
    );
  }

  // =========================
  // UPDATE
  // =========================

  updateExpense(
    id: number,
    request: CreateExpenseRequest
  ): Observable<Expense> {

    return this.http.put<Expense>(
      `${this.api}/${id}`,
      request
    );
  }

  // =========================
  // DELETE
  // =========================

  deleteExpense(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.api}/${id}`
    );
  }
  // =========================
// GET CONNECTED USERNAME
// =========================

getUsername(): string {

  const token = localStorage.getItem('token');

  if (!token) {
    return '';
  }

  try {

    const payload = JSON.parse(
      atob(token.split('.')[1])
    );

    return payload.sub || payload.username || '';

  } catch (error) {

    console.error('Error reading username from token:', error);

    return '';

  }
}

  // =========================
  // LOGOUT
  // =========================

  logout(): void {

    localStorage.removeItem('token');
  }

  // =========================
  // STATISTICS
  // =========================

 getStatistics(): Observable<ExpenseStatisticsResponse> {

  return this.http.get<ExpenseStatisticsResponse>(
    `${this.api}/statistics`
  );

}
  getMonthlyStatistics(): Observable<MonthlyStatistics[]> {

  return this.http.get<MonthlyStatistics[]>(
    `${this.api}/monthly-statistics`
  );

} 
getExpensesByMonth(
  year: number,
  month: number
): Observable<Expense[]> {

  return this.http.get<Expense[]>(
    `${this.api}/monthly/${year}/${month}`
  );

}


}