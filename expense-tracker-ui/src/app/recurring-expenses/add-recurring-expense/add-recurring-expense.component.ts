import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { RecurringExpenseService } from '../recurring-expense.service';

@Component({
  selector: 'app-add-recurring-expense',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl: './add-recurring-expense.component.html',
  styleUrl: './add-recurring-expense.component.css'
})
export class AddRecurringExpenseComponent {

  // ==========================================
  // FORM
  // ==========================================

  recurringForm: FormGroup;

  loading = false;


  // ==========================================
  // FREQUENCIES
  // ==========================================

  frequencies = [
    {
      value: 'DAILY',
      label: 'Daily'
    },
    {
      value: 'WEEKLY',
      label: 'Weekly'
    },
    {
      value: 'MONTHLY',
      label: 'Monthly'
    },
    {
      value: 'YEARLY',
      label: 'Yearly'
    }
  ];


  // ==========================================
  // CATEGORIES
  // ==========================================

  categories = [
    'Food',
    'Shopping',
    'Coffee',
    'Bills',
    'Water',
    'Entertainment',
    'Study',
    'Outils',
    'Transport',
    'Other'
  ];


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private fb: FormBuilder,
    private recurringExpenseService: RecurringExpenseService,
    private router: Router
  ) {

    this.recurringForm = this.fb.group({

      title: [
        '',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],

      amount: [
        null,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],

      category: [
        '',
        Validators.required
      ],

      frequency: [
        'MONTHLY',
        Validators.required
      ],

      startDate: [
        '',
        Validators.required
      ],

      endDate: [
        ''
      ]

    });

  }


  // ==========================================
  // GETTERS
  // ==========================================

  get title() {
    return this.recurringForm.get('title');
  }

  get amount() {
    return this.recurringForm.get('amount');
  }

  get category() {
    return this.recurringForm.get('category');
  }

  get frequency() {
    return this.recurringForm.get('frequency');
  }

  get startDate() {
    return this.recurringForm.get('startDate');
  }

  get endDate() {
    return this.recurringForm.get('endDate');
  }


  // ==========================================
  // SUBMIT
  // ==========================================

  submit(): void {

    // Stop if form invalid
    if (this.recurringForm.invalid) {

      this.recurringForm.markAllAsTouched();

      return;
    }


    // ==========================================
    // VALIDATE DATES
    // ==========================================

    const startDate =
      this.recurringForm.value.startDate;

    const endDate =
      this.recurringForm.value.endDate;


    if (
      endDate &&
      startDate > endDate
    ) {

      Swal.fire({
        icon: 'warning',
        title: 'Invalid dates',
        text: 'The end date cannot be before the start date.'
      });

      return;
    }


    // ==========================================
    // LOADING
    // ==========================================

    this.loading = true;


    // ==========================================
    // REQUEST
    // ==========================================

    const request = {

      title:
        this.recurringForm.value.title.trim(),

      amount:
        Number(this.recurringForm.value.amount),

      category:
        this.recurringForm.value.category,

      frequency:
        this.recurringForm.value.frequency,

      startDate:
        startDate,

      endDate:
        endDate || null

    };


    this.recurringExpenseService
      .createRecurringExpense(request)
      .subscribe({

        // ======================================
        // SUCCESS
        // ======================================

        next: () => {

          this.loading = false;

          Swal.fire({

            icon: 'success',

            title: 'Recurring expense created!',

            text:
              'Your recurring expense has been created successfully.',

            timer: 1800,

            showConfirmButton: false

          }).then(() => {

            this.router.navigate([
              '/recurring-expenses'
            ]);

          });

        },


        // ======================================
        // ERROR
        // ======================================

        error: (error) => {

          console.error(
            'Error creating recurring expense:',
            error
          );

          this.loading = false;

          Swal.fire({

            icon: 'error',

            title: 'Error',

            text:
              'Unable to create the recurring expense.'

          });

        }

      });

  }


  // ==========================================
  // CANCEL
  // ==========================================

  cancel(): void {

    this.router.navigate([
      '/recurring-expenses'
    ]);

  }

}