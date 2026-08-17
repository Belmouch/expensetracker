import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ExpenseService } from '../expense.service';
import { Expense } from '../../models/expense';

@Component({
  selector: 'app-monthly-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './monthly-details.component.html',
  styleUrl: './monthly-details.component.css'
})
export class MonthlyDetailsComponent implements OnInit {

  expenses: Expense[] = [];

  year!: number;
  month!: number;

  loading = false;

  constructor(
    private route: ActivatedRoute,
    private expenseService: ExpenseService
  ) {}

  ngOnInit(): void {

    this.year = Number(
      this.route.snapshot.paramMap.get('year')
    );

    this.month = Number(
      this.route.snapshot.paramMap.get('month')
    );

    this.loadExpenses();
  }

  loadExpenses(): void {

    this.loading = true;

    this.expenseService
      .getExpensesByMonth(this.year, this.month)
      .subscribe({

        next: (expenses) => {

          this.expenses = expenses;

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Error loading monthly expenses:',
            error
          );

          this.loading = false;

        }

      });
  }

  get totalAmount(): number {

    return this.expenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

  }

  get totalExpenses(): number {

    return this.expenses.length;

  }

  get monthName(): string {

    const date = new Date(
      this.year,
      this.month - 1,
      1
    );

    return date.toLocaleString('en-US', {
      month: 'long'
    });

  }

}