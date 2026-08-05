import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { ExpenseService } from '../expense.service';
import { CreateExpenseRequest } from '../../models/create-expense-request';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [FormsModule , CommonModule],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.css'
})
export class AddExpenseComponent implements OnInit {

  id: number | null = null;

  title = '';
  amount = 0;
  category = '';
  date = '';

  constructor(
    private expenseService: ExpenseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {

      this.id = Number(id);

      this.expenseService.getExpenseById(this.id).subscribe({

        next: (expense) => {

          this.title = expense.title;
          this.amount = expense.amount;
          this.category = expense.category;
          this.date = expense.date;

        },

        error: (error) => {

          console.error(error);

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Unable to load expense.'
          });

        }

      });

    }

  }

  saveExpense(): void {

    const request: CreateExpenseRequest = {
      title: this.title,
      amount: this.amount,
      category: this.category,
      date: this.date
    };

    if (this.id !== null) {

      this.expenseService.updateExpense(this.id, request).subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Expense Updated!',
            text: 'The expense has been updated successfully.',
            timer: 1500,
            showConfirmButton: false
          });

          this.router.navigate(['/expenses']);

        },

        error: (error) => {

          console.error(error);

          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'Unable to update the expense.'
          });

        }

      });

    } else {

      this.expenseService.saveExpense(request).subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Expense Saved!',
            text: 'The expense has been saved successfully.',
            timer: 1500,
            showConfirmButton: false
          });

          this.router.navigate(['/expenses']);

        },

        error: (error) => {

          console.error(error);

          Swal.fire({
            icon: 'error',
            title: 'Save Failed',
            text: 'Unable to save the expense.'
          });

        }

      });

    }

  }

}