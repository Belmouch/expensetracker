import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
    FormsModule
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


  // =========================
  // DAILY GROUPING
  // =========================

  dailyExpenses: DailyExpenses[] = [];


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

          const total =
            expenses.reduce(
              (sum, expense) =>
                sum + Number(expense.amount),
              0
            );

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