import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpenseService } from '../expense.service';
import { Expense } from '../../models/expense';
import { RouterLink, RouterModule } from '@angular/router';

imports: [
  CommonModule,
  RouterModule
]

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css'
})
export class ExpenseListComponent implements OnInit {

  expenses: Expense[] = [];

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {

    this.expenseService.getExpenses().subscribe({

      next: (response) => {

        this.expenses = response.content;

      },

      error: (error) => {

        console.error(error);

      }

    });

  }

}