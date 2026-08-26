import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { RecurringExpense } from '../models/recurring-expense';
import { RecurringExpenseService } from './recurring-expense.service';

@Component({
  selector: 'app-recurring-expenses',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './recurring-expenses.component.html',
  styleUrl: './recurring-expenses.component.css'
})
export class RecurringExpensesComponent implements OnInit {

  // =========================
  // RECURRING EXPENSES
  // =========================

  recurringExpenses: RecurringExpense[] = [];

  loading = false;


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private recurringExpenseService: RecurringExpenseService
  ) {}


  // =========================
  // INIT
  // =========================

  ngOnInit(): void {
    this.loadRecurringExpenses();
  }


  // =========================
  // LOAD
  // =========================

  loadRecurringExpenses(): void {

    this.loading = true;

    this.recurringExpenseService
      .getRecurringExpenses()
      .subscribe({

        next: (response) => {

          console.log(
            'Recurring expenses:',
            response
          );

          this.recurringExpenses = response;

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'Error loading recurring expenses:',
            error
          );

          this.loading = false;

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Unable to load recurring expenses.'
          });
        }

      });
  }


  // =========================
  // TOGGLE
  // =========================

  toggleExpense(
    expense: RecurringExpense
  ): void {

    if (!expense.id) {
      return;
    }

    this.recurringExpenseService
      .toggleRecurringExpense(expense.id)
      .subscribe({

        next: (updatedExpense) => {

          expense.active =
            updatedExpense.active;

          expense.nextRunDate =
            updatedExpense.nextRunDate;

        },

        error: (error) => {

          console.error(
            'Error toggling recurring expense:',
            error
          );

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              'Unable to update recurring expense.'
          });
        }

      });
  }


  // =========================
  // DELETE
  // =========================

  deleteExpense(
    expense: RecurringExpense
  ): void {

    if (!expense.id) {
      return;
    }

    Swal.fire({

      title: 'Delete recurring expense?',

      text:
        'This recurring expense will be permanently deleted.',

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText:
        'Yes, delete it!',

      cancelButtonText:
        'Cancel',

      confirmButtonColor:
        '#dc3545',

      cancelButtonColor:
        '#6c757d',

      reverseButtons: true

    }).then((result) => {

      if (!result.isConfirmed) {
        return;
      }


      this.recurringExpenseService
        .deleteRecurringExpense(expense.id!)
        .subscribe({

          next: () => {

            this.recurringExpenses =
              this.recurringExpenses.filter(
                item =>
                  item.id !== expense.id
              );


            Swal.fire({

              icon: 'success',

              title: 'Deleted!',

              text:
                'Recurring expense deleted successfully.',

              timer: 1500,

              showConfirmButton: false

            });

          },

          error: (error) => {

            console.error(
              'Error deleting recurring expense:',
              error
            );

            Swal.fire({

              icon: 'error',

              title: 'Error',

              text:
                'Unable to delete recurring expense.'

            });

          }

        });

    });
  }


  // =========================
  // FORMAT FREQUENCY
  // =========================

  formatFrequency(
    frequency: string
  ): string {

    if (!frequency) {
      return '';
    }

    return frequency
      .toLowerCase()
      .replace(
        /^\w/,
        char => char.toUpperCase()
      );
  }
  get totalRecurringAmount(): number {
  return this.recurringExpenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );
}

get activeRecurringCount(): number {
  return this.recurringExpenses.filter(
    expense => expense.active
  ).length;
}

get monthlyCommitment(): number {
  return this.recurringExpenses
    .filter(expense => expense.active)
    .reduce((total, expense) => {
      const amount = Number(expense.amount || 0);

      switch (expense.frequency) {
        case 'DAILY':
          return total + amount * 30;

        case 'WEEKLY':
          return total + amount * 4.33;

        case 'MONTHLY':
          return total + amount;

        case 'YEARLY':
          return total + amount / 12;

        default:
          return total;
      }
    }, 0);
}

}