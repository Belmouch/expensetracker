import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ExpenseService } from '../expense.service';
import { Expense } from '../../models/expense';

interface CategorySummary {
  name: string;
  count: number;
  amount: number;
  percentage: number;
}

interface DailySummary {
  date: string;
  count: number;
  amount: number;
}

@Component({
  selector: 'app-monthly-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './monthly-details.component.html',
  styleUrls: ['./monthly-details.component.css']
})
export class MonthlyDetailsComponent implements OnInit {

  // =========================
  // MONTH
  // =========================

  year = 0;
  month = 0;

  monthName = '';

  // =========================
  // EXPENSES
  // =========================

  expenses: Expense[] = [];

  loading = true;
  errorMessage = '';

  // =========================
  // STATISTICS
  // =========================

  totalExpenses = 0;
  totalAmount = 0;
  averageExpense = 0;

  biggestExpense: Expense | null = null;

  // =========================
  // CATEGORY
  // =========================

  categories: CategorySummary[] = [];

  // =========================
  // DAILY
  // =========================

  dailySummary: DailySummary[] = [];

  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private route: ActivatedRoute,
    private expenseService: ExpenseService,
    private router: Router
  ) {}

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      this.year = Number(params.get('year'));
      this.month = Number(params.get('month'));

      this.monthName = this.getMonthName(this.month);

      this.loadMonthlyExpenses();

    });

  }

  // =========================
  // LOAD MONTHLY EXPENSES
  // =========================

  loadMonthlyExpenses(): void {

    this.loading = true;
    this.errorMessage = '';

    this.expenseService
      .getExpensesByMonth(this.year, this.month)
      .subscribe({

        next: (expenses) => {

          this.expenses = expenses;

          this.calculateStatistics();

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Error loading monthly expenses:',
            error
          );

          this.errorMessage =
            'Unable to load this month expenses.';

          this.loading = false;

        }

      });

  }

  // =========================
  // CALCULATE STATISTICS
  // =========================

  calculateStatistics(): void {

    // Total expenses

    this.totalExpenses = this.expenses.length;


    // Total amount

    this.totalAmount = this.expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount),
      0
    );


    // Average

    this.averageExpense =
      this.totalExpenses > 0
        ? this.totalAmount / this.totalExpenses
        : 0;


    // Biggest expense

    this.biggestExpense =
      this.expenses.length > 0
        ? this.expenses.reduce(
            (max, expense) =>
              Number(expense.amount) >
              Number(max.amount)
                ? expense
                : max
          )
        : null;


    // Category statistics

    this.calculateCategories();


    // Daily statistics

    this.calculateDailySummary();

  }

  // =========================
  // CATEGORY STATISTICS
  // =========================

  calculateCategories(): void {

    const categoryMap: {
      [key: string]: {
        count: number;
        amount: number;
      }
    } = {};

    this.expenses.forEach(expense => {

      const category =
        expense.category?.trim() || 'Other';

      const displayName =
        category.charAt(0).toUpperCase() +
        category.slice(1).toLowerCase();

      if (!categoryMap[displayName]) {

        categoryMap[displayName] = {
          count: 0,
          amount: 0
        };

      }

      categoryMap[displayName].count++;

      categoryMap[displayName].amount +=
        Number(expense.amount);

    });


    this.categories = Object.entries(categoryMap)

      .map(([name, value]) => ({

        name,

        count: value.count,

        amount: value.amount,

        percentage:
          this.totalExpenses > 0
            ? (value.count / this.totalExpenses) * 100
            : 0

      }))

      .sort(
        (a, b) =>
          b.amount - a.amount
      );

  }

  // =========================
  // DAILY SUMMARY
  // =========================

  calculateDailySummary(): void {

    const dailyMap: {
      [key: string]: {
        count: number;
        amount: number;
      }
    } = {};


    this.expenses.forEach(expense => {

      const date = expense.date;

      if (!dailyMap[date]) {

        dailyMap[date] = {
          count: 0,
          amount: 0
        };

      }

      dailyMap[date].count++;

      dailyMap[date].amount +=
        Number(expense.amount);

    });


    this.dailySummary = Object.entries(dailyMap)

      .map(([date, value]) => ({

        date,

        count: value.count,

        amount: value.amount

      }))

      .sort(
        (a, b) =>
          b.date.localeCompare(a.date)
      );

  }

  // =========================
  // MONTH NAME
  // =========================

  getMonthName(month: number): string {

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    return months[month - 1] || '';

  }

  // =========================
  // FORMAT DATE
  // =========================

  formatDate(date: string): string {

    const parts = date.split('-');

    if (parts.length !== 3) {
      return date;
    }

    const year = parts[0];
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    return `${this.getMonthShortName(month)} ${day}, ${year}`;

  }

  // =========================
  // SHORT MONTH
  // =========================

  getMonthShortName(month: number): string {

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];

    return months[month - 1] || '';

  }

  // =========================
  // BACK
  // =========================

  goBack(): void {

    this.router.navigate([
      '/expenses/monthly'
    ]);

  }

}