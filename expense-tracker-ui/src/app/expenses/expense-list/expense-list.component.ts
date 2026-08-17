import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ExpenseService } from '../expense.service';
import { Expense } from '../../models/expense';

import Swal from 'sweetalert2';
import { ExpenseStatisticsResponse } from '../../models/expense-statistics-response';


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

    this.loadExpenses();

    this.loadStatistics();

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
        this.fromDate || undefined,
        this.toDate || undefined
      )
      .subscribe({

        next: (response) => {

          this.expenses = response.content;

          this.totalPages = response.totalPages;

          this.totalElements = response.totalElements;

          // Apply search
          this.searchExpenses();

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
  // LOAD STATISTICS
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
  // SEARCH BY TITLE
  // =========================

  searchExpenses(): void {

    const search = this.searchText
      .trim()
      .toLowerCase();


    if (!search) {

      this.filteredExpenses = [...this.expenses];

    } else {

      this.filteredExpenses =
        this.expenses.filter(
          expense =>
            expense.title
              .toLowerCase()
              .includes(search)
        );

    }


    // Rebuild daily groups
    this.buildDailyExpenses();

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
        text: 'The start date cannot be after the end date.'
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

    return this.totalElements;

  }


  // =========================
  // TOTAL AMOUNT
  // =========================

  get totalAmount(): number {

    return this.statistics?.totalAmount ?? 0;

  }


  // =========================
  // NEXT PAGE
  // =========================

  nextPage(): void {

    if (this.page < this.totalPages - 1) {

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

      text: 'You will not be able to recover this expense!',

      icon: 'warning',

      showCancelButton: true,

      confirmButtonColor: '#198754',

      cancelButtonColor: '#dc3545',

      confirmButtonText: 'Yes, delete it!',

      cancelButtonText: 'Cancel'

    }).then((result) => {

      if (result.isConfirmed) {

        this.expenseService
          .deleteExpense(id)
          .subscribe({

            next: () => {

              this.loadExpenses();

              this.loadStatistics();

              Swal.fire({

                icon: 'success',

                title: 'Deleted!',

                text: 'Expense deleted successfully.',

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

                text: 'Unable to delete expense.'

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

      text: 'Do you want to logout?',

      icon: 'question',

      showCancelButton: true,

      confirmButtonText: 'Logout',

      cancelButtonText: 'Cancel'

    }).then((result) => {

      if (result.isConfirmed) {

        this.expenseService.logout();

        this.router.navigate(['/login']);

      }

    });

  }

}