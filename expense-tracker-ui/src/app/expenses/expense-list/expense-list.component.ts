import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpenseService } from '../expense.service';
import { Expense } from '../../models/expense';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css'
})
export class ExpenseListComponent implements OnInit {

  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  loading = false;
  page = 0;
  size = 10;

  totalPages = 0;
  totalElements = 0;

  searchText = '';

  constructor(private expenseService: ExpenseService, private router: Router) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {

      this.loading = true;

  this.expenseService.getExpenses(this.page, this.size).subscribe({

    next: (response) => {

      this.expenses = response.content;
      this.filteredExpenses = response.content;

      this.totalPages = response.totalPages;
      this.totalElements = response.totalElements;

      this.loading = false;

    },

    error: (error) => {

      console.error(error);

      this.loading = false;

    }

  });

  }

  searchExpenses(): void {

    this.filteredExpenses = this.expenses.filter(expense =>

      expense.title
        .toLowerCase()
        .includes(this.searchText.toLowerCase())

    );

  }

  get totalExpenses(): number {

    return this.totalElements;

  }

  get totalAmount(): number {

    return this.filteredExpenses.reduce(

      (sum, expense) => sum + expense.amount,

      0

    );

  }

  nextPage(): void {

    if (this.page < this.totalPages - 1) {

      this.page++;
      this.loadExpenses();

    }

  }

  previousPage(): void {

    if (this.page > 0) {

      this.page--;
      this.loadExpenses();

    }

  }
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

      this.expenseService.deleteExpense(id).subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Expense deleted successfully.',
            timer: 1500,
            showConfirmButton: false
          });

          this.loadExpenses();

        },

        error: (error) => {

          console.error(error);

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