import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Budget } from '../../models/budget.model';
import { Expense } from '../../models/expense';
import { ExpenseService } from '../../expenses/expense.service';

@Component({
  selector: 'app-budget-details',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './budget-details.component.html',
  styleUrl: './budget-details.component.css'
})
export class BudgetDetailsComponent implements OnChanges {

  // =========================================================
  // INPUT
  // =========================================================

  @Input() budget!: Budget;


  // =========================================================
  // DATA
  // =========================================================

  expenses: Expense[] = [];

  loading = false;

  errorMessage = '';


  // =========================================================
  // STATISTICS
  // =========================================================

  totalExpenses = 0;

  totalSpent = 0;

  remaining = 0;

  percentage = 0;

  averageExpense = 0;

  highestExpense = 0;

  highestExpenseTitle = '';


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private expenseService: ExpenseService
  ) {}


  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['budget'] &&
      this.budget
    ) {
      this.loadBudgetExpenses();
    }

  }


  // =========================================================
  // LOAD BUDGET EXPENSES
  // =========================================================

  loadBudgetExpenses(): void {

    if (!this.budget) {
      return;
    }

    this.loading = true;

    this.errorMessage = '';

    this.expenses = [];

    this.resetStatistics();


    this.expenseService
      .getExpenses(
        0,
        1000,
        undefined,
        this.budget.startDate,
        this.budget.endDate
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Budget expenses:',
            response
          );


          // -----------------------------------------
          // GET EXPENSES
          // -----------------------------------------

          const allExpenses =
            response.content ?? [];


          // -----------------------------------------
          // FILTER BY CATEGORY
          // -----------------------------------------

          this.expenses =
            allExpenses.filter(
              (expense: Expense) =>
                this.normalizeCategory(
                  expense.category
                ) ===
                this.normalizeCategory(
                  this.budget.category
                )
            );


          // -----------------------------------------
          // CALCULATE STATISTICS
          // -----------------------------------------

          this.calculateStatistics();


          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Error loading budget expenses:',
            error
          );

          this.errorMessage =
            'Unable to load budget expenses.';

          this.loading = false;

        }

      });

  }


  // =========================================================
  // CALCULATE STATISTICS
  // =========================================================

  calculateStatistics(): void {

    // -----------------------------------------
    // TOTAL NUMBER OF EXPENSES
    // -----------------------------------------

    this.totalExpenses =
      this.expenses.length;


    // -----------------------------------------
    // TOTAL SPENT
    // -----------------------------------------

    this.totalSpent =
      this.expenses.reduce(
        (
          total: number,
          expense: Expense
        ) => total + expense.amount,
        0
      );


    // -----------------------------------------
    // REMAINING
    // -----------------------------------------

    this.remaining =
      this.budget.amount - this.totalSpent;


    // -----------------------------------------
    // PERCENTAGE
    // -----------------------------------------

    if (this.budget.amount > 0) {

      this.percentage =
        (this.totalSpent / this.budget.amount) * 100;

    } else {

      this.percentage = 0;

    }


    // -----------------------------------------
    // AVERAGE EXPENSE
    // -----------------------------------------

    if (this.totalExpenses > 0) {

      this.averageExpense =
        this.totalSpent / this.totalExpenses;

    } else {

      this.averageExpense = 0;

    }


    // -----------------------------------------
    // HIGHEST EXPENSE
    // -----------------------------------------

    if (this.expenses.length > 0) {

      const highest =
        this.expenses.reduce(
          (
            max: Expense,
            expense: Expense
          ) =>
            expense.amount > max.amount
              ? expense
              : max
        );


      this.highestExpense =
        highest.amount;

      this.highestExpenseTitle =
        highest.title;

    } else {

      this.highestExpense = 0;

      this.highestExpenseTitle = '';

    }

  }


  // =========================================================
  // RESET STATISTICS
  // =========================================================

  resetStatistics(): void {

    this.totalExpenses = 0;

    this.totalSpent = 0;

    this.remaining = this.budget?.amount ?? 0;

    this.percentage = 0;

    this.averageExpense = 0;

    this.highestExpense = 0;

    this.highestExpenseTitle = '';

  }


  // =========================================================
  // PROGRESS PERCENTAGE
  // =========================================================

  get progressPercentage(): number {

    return Math.min(
      Math.max(
        this.percentage,
        0
      ),
      100
    );

  }


  // =========================================================
  // BUDGET STATUS
  // =========================================================

  get budgetStatus(): string {

    if (this.percentage >= 100) {
      return 'Exceeded';
    }

    if (this.percentage >= 80) {
      return 'Almost reached';
    }

    if (this.percentage >= 50) {
      return 'On track';
    }

    return 'Healthy';

  }


  // =========================================================
  // BUDGET STATUS CLASS
  // =========================================================

  get budgetStatusClass(): string {

    if (this.percentage >= 100) {
      return 'danger';
    }

    if (this.percentage >= 80) {
      return 'warning';
    }

    return 'success';

  }


  // =========================================================
  // REMAINING STATUS
  // =========================================================

  get isExceeded(): boolean {

    return this.remaining < 0;

  }


  // =========================================================
  // NORMALIZE CATEGORY
  // =========================================================

  private normalizeCategory(
    category: string | null | undefined
  ): string {

    return (
      category
        ?.trim()
        .toLowerCase() ?? ''
    );

  }


  // =========================================================
  // FORMAT DATE
  // =========================================================

  formatDate(date: string): string {

    if (!date) {
      return '';
    }

    const parsedDate =
      new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );

  }


  // =========================================================
  // FORMAT MONEY
  // =========================================================

  formatAmount(
    amount: number
  ): string {

    return amount.toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  }

}