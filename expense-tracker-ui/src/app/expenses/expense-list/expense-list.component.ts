import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { forkJoin, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { MonthlyStatistics } from '../../models/monthly-statistics';
import { ExpenseStatisticsResponse } from '../../models/expense-statistics-response';

import { ExpenseService } from '../expense.service';
import { Expense } from '../../models/expense';

import Swal from 'sweetalert2';


// =========================
// DAILY EXPENSES INTERFACE
// =========================

interface DailyExpenses {
  date: string;
  expenses: Expense[];
  total: number;
}


@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
      FormsModule,
      NgChartsModule
  ],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css'
})
export class ExpenseListComponent implements OnInit {

  // =========================
  // EXPENSES
  // =========================

  expenses: Expense[] = [];

  filteredExpenses: Expense[] = [];

  loading = false;


  // =========================
  // STATISTICS
  // =========================

  statistics: ExpenseStatisticsResponse | null = null;

  username = '';

  monthlyStatistics: MonthlyStatistics[] = [];

  currentMonthStatistics: MonthlyStatistics | null = null;

  selectedMonth = this.toMonthInputValue(new Date());

  overviewExpenses: Expense[] = [];

  overviewLoading = false;

  readonly overviewChartType: ChartType = 'line';

  overviewChartData: ChartData<'line', number[], string> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Daily spending',
      borderColor: '#4779e8',
      backgroundColor: 'rgba(71, 121, 232, 0.14)',
      pointBackgroundColor: '#4779e8',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.35
    }]
  };

  overviewChartDates: string[] = [];

  readonly overviewChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: items => {
            const index = items[0]?.dataIndex ?? 0;
            const date = this.overviewChartDates[index];
            return date ? this.formatOverviewDate(date) : '';
          },
          label: context => `${this.formatAmount(Number(context.parsed.y))} DH`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 10 }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(127, 149, 190, 0.18)' },
        ticks: {
          callback: value => `${value} DH`
        }
      }
    }
  };


  // =========================
  // DAILY GROUPING
  // =========================

  dailyExpenses: DailyExpenses[] = [];

  dailyTotals: { [date: string]: number } = {};

  monthlyExpensesCache: { [month: string]: Expense[] } = {};

  private monthlyExpenseRequests: {
    [month: string]: Observable<Expense[]>
  } = {};


  // =========================
  // PAGINATION
  // =========================

  page = 0;

  size = 10;

  totalPages = 0;

  totalElements = 0;


  // =========================
  // SEARCH
  // =========================

  searchText = '';


  // =========================
  // DATE FILTER
  // =========================

  fromDate = '';

  toDate = '';


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private expenseService: ExpenseService,
    private router: Router
  ) {}


  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.username = this.expenseService.getUsername();

    this.loadExpenses();

    this.loadStatistics();

    this.loadMonthlyStatistics();

    this.loadOverviewExpenses();

  }

  loadOverviewExpenses(): void {
    const { year, month } = this.parseMonth(this.selectedMonth);
    this.overviewLoading = true;

    const monthKey = this.selectedMonth;
    const request = this.monthlyExpensesCache[monthKey]
      ? new Observable<Expense[]>(subscriber => {
        subscriber.next(this.monthlyExpensesCache[monthKey]);
        subscriber.complete();
      })
      : (this.monthlyExpenseRequests[monthKey] || (this.monthlyExpenseRequests[monthKey] =
        this.expenseService.getExpensesByMonth(year, month).pipe(shareReplay(1))));

    request
      .subscribe({
        next: expenses => {
          this.overviewExpenses = Array.isArray(expenses) ? expenses : [];
          this.monthlyExpensesCache[this.selectedMonth] = this.overviewExpenses;
          this.buildOverviewChart();
          this.overviewLoading = false;
        },
        error: error => {
          console.error('Error loading overview expenses:', error);
          this.overviewExpenses = [];
          this.buildOverviewChart();
          this.overviewLoading = false;
        }
      });
  }

  onOverviewMonthChange(): void {
    if (/^\d{4}-\d{2}$/.test(this.selectedMonth)) {
      this.loadOverviewExpenses();
    }
  }

  get overviewTotal(): number {
    return this.overviewExpenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );
  }

  get overviewTransactionCount(): number {
    return this.overviewExpenses.length;
  }

  get todayAmount(): number {
    const today = this.toDateInputValue(new Date());
    return this.overviewExpenses
      .filter(expense => expense.date === today)
      .reduce((total, expense) => total + Number(expense.amount), 0);
  }

  get todayTransactionCount(): number {
    const today = this.toDateInputValue(new Date());
    return this.overviewExpenses.filter(expense => expense.date === today).length;
  }

  get overviewDailyAverage(): number {
    const activeDays = new Set(this.overviewExpenses.map(expense => expense.date)).size;
    return activeDays > 0 ? this.overviewTotal / activeDays : 0;
  }

  get overviewMonthLabel(): string {
    const { year, month } = this.parseMonth(this.selectedMonth);
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }

  formatAmount(amount: number): string {
    return (Number.isFinite(amount) ? amount : 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  private buildOverviewChart(): void {
    const selected = this.parseMonth(this.selectedMonth);
    const daysInMonth = new Date(selected.year, selected.month, 0).getDate();

    const totals = new Map<string, number>();
    this.overviewExpenses.forEach(expense => {
      totals.set(expense.date, (totals.get(expense.date) || 0) + Number(expense.amount));
    });

    const points = Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(selected.year, selected.month - 1, index + 1);
      const dateValue = this.toDateInputValue(date);
      return {
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        date: dateValue,
        total: totals.get(dateValue) || 0
      };
    });

    this.overviewChartDates = points.map(point => point.date);
    this.overviewChartData = {
      labels: points.map(point => point.label),
      datasets: [{
        ...this.overviewChartData.datasets[0],
        data: points.map(point => point.total)
      }]
    };
  }

  private formatOverviewDate(dateValue: string): string {
    return new Date(`${dateValue}T00:00:00`).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  private parseMonth(value: string): { year: number; month: number } {
    const [year, month] = value.split('-').map(Number);
    return {
      year: year || new Date().getFullYear(),
      month: month || new Date().getMonth() + 1
    };
  }

  private toMonthInputValue(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private toDateInputValue(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }


  // =========================
  // LOAD EXPENSES
  // =========================

  loadExpenses(): void {

    this.loading = true;

    this.expenseService
      .getExpenses(
        this.page,
        this.size,
        this.searchText,
        this.fromDate || undefined,
        this.toDate || undefined
      )
      .subscribe({

        next: (response) => {

          // Expenses returned by backend
          this.expenses = response.content;

          // Pagination information
          this.totalPages = response.totalPages;

          this.totalElements = response.totalElements;

          // No client-side search anymore
          // Backend already filtered the results
          this.filteredExpenses = [...this.expenses];

          // Group expenses by date
          this.buildDailyExpenses();

          this.loading = false;

          this.loadDailyTotalsForCurrentPage();

        },

        error: (error) => {

          console.error(
            'Error loading expenses:',
            error
          );

          this.loading = false;

        }

      });

  }


  // =========================
  // LOAD GLOBAL STATISTICS
  // =========================

  loadStatistics(): void {

    this.expenseService
      .getStatistics()
      .subscribe({

        next: (response) => {

          this.statistics = response;

        },

        error: (error) => {

          console.error(
            'Error loading statistics:',
            error
          );

        }

      });

  }


  // =========================
  // LOAD MONTHLY STATISTICS
  // =========================

  loadMonthlyStatistics(): void {

    this.expenseService
      .getMonthlyStatistics()
      .subscribe({

        next: (response) => {

          this.monthlyStatistics = response;

          const now = new Date();

          const currentYear = now.getFullYear();

          const currentMonth = now.getMonth() + 1;

          this.currentMonthStatistics =
            response.find(
              item =>
                item.year === currentYear &&
                item.month === currentMonth
            ) || null;

        },

        error: (error) => {

          console.error(
            'Error loading monthly statistics:',
            error
          );

        }

      });

  }


  // =========================
  // SEARCH
  // =========================

  searchExpenses(): void {

    // Go back to first page
    this.page = 0;

    // Search is now handled by backend
    this.loadExpenses();

  }


  // =========================
  // GROUP EXPENSES BY DATE
  // =========================

  private loadDailyTotalsForCurrentPage(): void {

    const months = Array.from(
      new Set(
        this.filteredExpenses.map(expense => expense.date.slice(0, 7))
      )
    );

    const missingMonths = months.filter(
      month => !this.monthlyExpensesCache[month]
    );

    if (missingMonths.length === 0) {
      this.calculateDailyTotals();
      return;
    }

    const requests = missingMonths.map(month => {
      if (!this.monthlyExpenseRequests[month]) {
        const [year, monthNumber] = month.split('-').map(Number);

        this.monthlyExpenseRequests[month] = this.expenseService
          .getExpensesByMonth(year, monthNumber)
          .pipe(shareReplay(1));
      }

      return this.monthlyExpenseRequests[month];
    });

    forkJoin(requests).subscribe({
      next: (monthlyExpenses) => {
        monthlyExpenses.forEach((expenses, index) => {
          this.monthlyExpensesCache[missingMonths[index]] = expenses;
        });

        this.calculateDailyTotals();
      },
      error: (error) => {
        console.error(
          'Error loading monthly expenses for daily totals:',
          error
        );

        missingMonths.forEach(month => {
          delete this.monthlyExpenseRequests[month];
        });
      }
    });
  }

  private calculateDailyTotals(): void {

    const totals: { [date: string]: number } = {};

    Object.values(this.monthlyExpensesCache)
      .flat()
      .filter(expense => this.matchesActiveFilters(expense))
      .forEach(expense => {
        totals[expense.date] =
          (totals[expense.date] || 0) + Number(expense.amount);
      });

    this.dailyTotals = totals;
    this.buildDailyExpenses();
  }

  private matchesActiveFilters(expense: Expense): boolean {

    const search = this.searchText.trim().toLowerCase();

    return (!search || expense.title.toLowerCase().includes(search))
      && (!this.fromDate || expense.date >= this.fromDate)
      && (!this.toDate || expense.date <= this.toDate);
  }

  buildDailyExpenses(): void {

    const groups: {
      [date: string]: Expense[]
    } = {};


    // Group expenses
    this.filteredExpenses.forEach(
      (expense) => {

        const date = expense.date;

        if (!groups[date]) {

          groups[date] = [];

        }

        groups[date].push(expense);

      }
    );


    // Convert groups to array
    this.dailyExpenses =
      Object.keys(groups)

        // Newest date first
        .sort((a, b) =>
          b.localeCompare(a)
        )

        .map((date) => {

          const expenses = groups[date];

          const total = this.dailyTotals[date] ?? 0;

          return {
            date: date,
            expenses: expenses,
            total: total
          };

        });

  }


  // =========================
  // APPLY DATE FILTER
  // =========================

  applyDateFilter(): void {

    if (
      this.fromDate &&
      this.toDate &&
      this.fromDate > this.toDate
    ) {

      Swal.fire({

        icon: 'warning',

        title: 'Invalid dates',

        text:
          'The start date cannot be after the end date.'

      });

      return;

    }


    // Start from first page
    this.page = 0;


    // Reload from backend
    this.loadExpenses();

  }


  // =========================
  // CLEAR FILTERS
  // =========================

  clearFilters(): void {

    this.searchText = '';

    this.fromDate = '';

    this.toDate = '';

    this.page = 0;

    this.loadExpenses();

  }


  // =========================
  // TOTAL EXPENSES
  // =========================

  get totalExpenses(): number {

    return this.statistics?.totalExpenses ?? 0;

  }


  // =========================
  // TOTAL AMOUNT
  // =========================

  get totalAmount(): number {

    return this.statistics?.totalAmount ?? 0;

  }


  // =========================
  // CURRENT MONTH EXPENSES
  // =========================

  get currentMonthExpenses(): number {

    return this.currentMonthStatistics?.count ?? 0;

  }


  // =========================
  // CURRENT MONTH AMOUNT
  // =========================

  get currentMonthAmount(): number {

    return this.currentMonthStatistics?.total ?? 0;

  }


  // =========================
  // NEXT PAGE
  // =========================

  nextPage(): void {

    if (
      this.page <
      this.totalPages - 1
    ) {

      this.page++;

      this.loadExpenses();

    }

  }


  // =========================
  // PREVIOUS PAGE
  // =========================

  previousPage(): void {

    if (this.page > 0) {

      this.page--;

      this.loadExpenses();

    }

  }


  // =========================
  // DELETE
  // =========================

  deleteExpense(id: number): void {

    Swal.fire({

      title: 'Delete Expense?',

      text:
        'You will not be able to recover this expense!',

      icon: 'warning',

      showCancelButton: true,

      confirmButtonColor: '#198754',

      cancelButtonColor: '#dc3545',

      confirmButtonText:
        'Yes, delete it!',

      cancelButtonText:
        'Cancel'

    }).then((result) => {

      if (result.isConfirmed) {

        this.expenseService
          .deleteExpense(id)
          .subscribe({

            next: () => {

              this.monthlyExpensesCache = {};
              this.monthlyExpenseRequests = {};

              // Reload expenses
              this.loadExpenses();

              // Reload global statistics
              this.loadStatistics();

              // Reload monthly statistics
              this.loadMonthlyStatistics();


              Swal.fire({

                icon: 'success',

                title: 'Deleted!',

                text:
                  'Expense deleted successfully.',

                timer: 1500,

                showConfirmButton: false

              });

            },

            error: (error) => {

              console.error(
                'Error deleting expense:',
                error
              );

              Swal.fire({

                icon: 'error',

                title: 'Error',

                text:
                  'Unable to delete expense.'

              });

            }

          });

      }

    });

  }


  // =========================
  // LOGOUT
  // =========================

  logout(): void {

    Swal.fire({

      title: 'Logout?',

      text:
        'Do you want to logout?',

      icon: 'question',

      showCancelButton: true,

      confirmButtonText:
        'Logout',

      cancelButtonText:
        'Cancel',

      confirmButtonColor:
        '#198754',

      cancelButtonColor:
        '#dc3545',

      reverseButtons: true

    }).then((result) => {

      if (result.isConfirmed) {

        this.expenseService.logout();

        this.router.navigate(['/login']);

      }

    });

  }

}