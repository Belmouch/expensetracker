import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Budget } from '../models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  private api = 'http://localhost:8080/budgets';

  constructor(private http: HttpClient) {}

  // =========================
  // GET MY BUDGETS
  // =========================

  getMyBudgets(): Observable<Budget[]> {

    return this.http.get<Budget[]>(
      `${this.api}/me`
    );
  }

  // =========================
  // GET BY ID
  // =========================

  getBudgetById(id: number): Observable<Budget> {

    return this.http.get<Budget>(
      `${this.api}/${id}`
    );
  }

  // =========================
  // CREATE MY BUDGET
  // =========================

  createBudget(
    budget: any
  ): Observable<Budget> {

    return this.http.post<Budget>(
      `${this.api}/me`,
      budget
    );
  }

  // =========================
  // UPDATE
  // =========================

  updateBudget(
    id: number,
    budget: any
  ): Observable<Budget> {

    return this.http.put<Budget>(
      `${this.api}/${id}`,
      budget
    );
  }

  // =========================
  // DELETE
  // =========================

  deleteBudget(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.api}/${id}`
    );
  }
}