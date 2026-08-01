import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Expense } from '../models/expense';
import { PageResponse } from '../models/page-response';
import { CreateExpenseRequest } from '../models/create-expense-request';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private api = 'http://localhost:8080/expenses';

  constructor(private http: HttpClient) {}

  getExpenses(): Observable<PageResponse<Expense>> {

    return this.http.get<PageResponse<Expense>>(this.api);

  }
  saveExpense(request: CreateExpenseRequest): Observable<Expense> {

  console.log("SERVICE CALLED");

  return this.http.post<Expense>(this.api, request);

}
   
}
