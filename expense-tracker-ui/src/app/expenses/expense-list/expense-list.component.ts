import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ExpenseService } from '../expense.service';
import { Expense } from '../../models/expense';

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

  page = 0;
  size = 10;

  totalPages = 0;
  totalElements = 0;

  searchText = '';

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {

    this.expenseService.getExpenses(this.page, this.size).subscribe({

      next: (response) => {

        this.expenses = response.content;
        this.filteredExpenses = response.content;

        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;

      },

      error: (error) => {

        console.error(error);

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

}