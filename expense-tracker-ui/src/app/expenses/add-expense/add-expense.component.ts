import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ExpenseService } from '../expense.service';
import { CreateExpenseRequest } from '../../models/create-expense-request';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.css'
})
export class AddExpenseComponent {

  title = '';
  amount = 0;
  category = '';
  date = '';

  constructor(
    private expenseService: ExpenseService,
    private router: Router
  ) {}

  saveExpense(): void {

    const request: CreateExpenseRequest = {
      title: this.title,
      amount: this.amount,
      category: this.category,
      date: this.date
    };

    this.expenseService.saveExpense(request).subscribe({

      next: () => {

        alert('Expense saved');
        this.router.navigate(['/expenses']);

      },

      error: (error) => {

        console.error(error);

      }

    });

  }

}