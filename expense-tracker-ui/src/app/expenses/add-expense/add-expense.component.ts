import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { ExpenseService } from '../expense.service';
import { CreateExpenseRequest } from '../../models/create-expense-request';

@Component({
  selector: 'app-add-expense',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.css'
})
export class AddExpenseComponent implements OnInit {

  private readonly customCategoriesStorageKey =
    'expense_tracker_custom_categories';

  private readonly predefinedCategories: string[] = [
    'Food',
    'Shopping',
    'Coffee',
    'Bills',
    'Water',
    'Entertainment',
    'Study',
    'Outils',
    'Transport'
  ];

  // =====================================================
  // EDIT MODE
  // =====================================================

  id: number | null = null;


  // =====================================================
  // FORM DATA
  // =====================================================

  title = '';

  amount: number | null = null;

  category = '';

  otherCategory = '';

  date = '';


  // =====================================================
  // CATEGORY DROPDOWN
  // =====================================================

  categoryDropdownOpen = false;

  categories: string[] = [
    ...this.predefinedCategories,
    'Other'
  ];


  // =====================================================
  // LOADING
  // =====================================================

  loading = false;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private expenseService: ExpenseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadCustomCategories();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {

      this.id = Number(id);

      this.loadExpense(this.id);

    } else {

      // New expense → today's date
      this.date = this.getTodayDate();

    }

  }


  // =====================================================
  // LOAD EXPENSE
  // =====================================================

  loadExpense(id: number): void {

    this.loading = true;

    this.expenseService
      .getExpenseById(id)
      .subscribe({

        next: (expense) => {

          // -------------------------
          // Basic information
          // -------------------------

          this.title = expense.title;

          this.amount = expense.amount;

          this.date = expense.date;


          // -------------------------
          // Categories
          // -------------------------

          const knownCategory = this.findKnownCategory(expense.category);

          if (knownCategory) {

            this.category = knownCategory;

            this.otherCategory = '';

          } else {

            this.category = this.addCustomCategory(expense.category);

            this.otherCategory = '';

          }


          this.loading = false;

        },


        error: (error) => {

          console.error(
            'Error loading expense:',
            error
          );

          this.loading = false;

          Swal.fire({

            icon: 'error',

            title: 'Error',

            text: 'Unable to load expense.'

          });

        }

      });

  }


  // =====================================================
  // GET TODAY DATE
  // =====================================================

  getTodayDate(): string {

    const today = new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        today.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;

  }


  // =====================================================
  // CATEGORY DROPDOWN
  // =====================================================

  toggleCategoryDropdown(): void {

    this.categoryDropdownOpen =
      !this.categoryDropdownOpen;

  }


  // =====================================================
  // SELECT CATEGORY
  // =====================================================

  selectCategory(category: string): void {

    this.category = category;

    // Close dropdown
    this.categoryDropdownOpen = false;


    // If standard category selected,
    // clear custom category

    if (category !== 'Other') {

      this.otherCategory = '';

    }

  }


  // =====================================================
  // CATEGORY ICON
  // =====================================================

  getCategoryIcon(category: string): string {

    switch (category) {

      case 'Food':
        return 'bi bi-egg-fried';

      case 'Shopping':
        return 'bi bi-bag';

      case 'Coffee':
        return 'bi bi-cup-hot';

      case 'Bills':
        return 'bi bi-receipt';

      case 'Water':
        return 'bi bi-droplet';

      case 'Entertainment':
        return 'bi bi-controller';

      case 'Study':
        return 'bi bi-book';

      case 'Outils':
        return 'bi bi-tools';

      case 'Transport':
        return 'bi bi-car-front';

      case 'Other':
        return 'bi bi-three-dots';

      default:
        return 'bi bi-grid';

    }

  }


  // =====================================================
  // CUSTOM CATEGORIES
  // =====================================================

  loadCustomCategories(): void {

    if (typeof localStorage === 'undefined') {
      return;
    }

    try {

      const storedCategories = localStorage.getItem(
        this.customCategoriesStorageKey
      );

      if (!storedCategories) {
        return;
      }

      const customCategories: unknown = JSON.parse(storedCategories);

      if (Array.isArray(customCategories)) {

        customCategories.forEach((category) => {

          if (typeof category === 'string') {
            this.addCategoryToList(category.trim());
          }

        });

      }

      this.saveCustomCategories();

    } catch (error) {

      console.error(
        'Error loading custom categories:',
        error
      );

    }

  }


  saveCustomCategories(): void {

    if (typeof localStorage === 'undefined') {
      return;
    }

    try {

      localStorage.setItem(
        this.customCategoriesStorageKey,
        JSON.stringify(
          this.categories.filter(
            (category) =>
              category !== 'Other' && !this.isPredefinedCategory(category)
          )
        )
      );

    } catch (error) {

      console.error(
        'Error saving custom categories:',
        error
      );

    }

  }


  addCustomCategory(category: string): string {

    const trimmedCategory = category.trim();
    const knownCategory = this.findKnownCategory(trimmedCategory);

    if (knownCategory) {
      return knownCategory;
    }

    if (trimmedCategory && trimmedCategory.toLowerCase() !== 'other') {
      this.addCategoryToList(trimmedCategory);
      this.saveCustomCategories();
    }

    return trimmedCategory;

  }


  private addCategoryToList(category: string): void {

    const trimmedCategory = category.trim();

    if (
      !trimmedCategory ||
      trimmedCategory.toLowerCase() === 'other' ||
      this.findKnownCategory(trimmedCategory)
    ) {
      return;
    }

    const otherIndex = this.categories.indexOf('Other');

    this.categories.splice(
      otherIndex === -1 ? this.categories.length : otherIndex,
      0,
      trimmedCategory
    );

  }


  private findKnownCategory(category: string): string | undefined {

    const normalizedCategory = category.trim().toLowerCase();

    return this.categories.find(
      (knownCategory) =>
        knownCategory.toLowerCase() === normalizedCategory
    );

  }


  private isPredefinedCategory(category: string): boolean {

    return this.predefinedCategories.some(
      (predefinedCategory) =>
        predefinedCategory.toLowerCase() === category.trim().toLowerCase()
    );

  }


  // =====================================================
  // SAVE EXPENSE
  // =====================================================

  saveExpense(): void {

    // ===================================================
    // VALIDATE TITLE
    // ===================================================

    if (!this.title.trim()) {

      Swal.fire({

        icon: 'warning',

        title: 'Missing title',

        text: 'Please enter an expense title.'

      });

      return;

    }


    // ===================================================
    // VALIDATE AMOUNT
    // ===================================================

    if (
      this.amount === null ||
      this.amount <= 0
    ) {

      Swal.fire({

        icon: 'warning',

        title: 'Invalid amount',

        text: 'Please enter an amount greater than 0.'

      });

      return;

    }


    // ===================================================
    // VALIDATE CATEGORY
    // ===================================================

    if (!this.category) {

      Swal.fire({

        icon: 'warning',

        title: 'Missing category',

        text: 'Please select a category.'

      });

      return;

    }


    // ===================================================
    // FINAL CATEGORY
    // ===================================================

    let finalCategory = this.category;


    // If Other → use custom category

    if (this.category === 'Other') {

      if (!this.otherCategory.trim()) {

        Swal.fire({

          icon: 'warning',

          title: 'Missing category',

          text: 'Please enter your category.'

        });

        return;

      }

      finalCategory = this.otherCategory.trim();

    }


    // ===================================================
    // VALIDATE DATE
    // ===================================================

    if (!this.date) {

      Swal.fire({

        icon: 'warning',

        title: 'Missing date',

        text: 'Please select a date.'

      });

      return;

    }


    // ===================================================
    // CREATE REQUEST
    // ===================================================

    const request: CreateExpenseRequest = {

      title: this.title.trim(),

      amount: this.amount,

      category: finalCategory,

      date: this.date

    };


    // Start loading

    this.loading = true;


    // ===================================================
    // UPDATE EXPENSE
    // ===================================================

    if (this.id !== null) {

      this.expenseService
        .updateExpense(
          this.id,
          request
        )
        .subscribe({

          next: () => {

            this.loading = false;

            this.addCustomCategory(finalCategory);


            Swal.fire({

              icon: 'success',

              title: 'Expense Updated!',

              text:
                'The expense has been updated successfully.',

              timer: 1500,

              showConfirmButton: false

            });


            this.router.navigate([
              '/expenses'
            ]);

          },


          error: (error) => {

            console.error(
              'Error updating expense:',
              error
            );

            this.loading = false;


            Swal.fire({

              icon: 'error',

              title: 'Update Failed',

              text:
                'Unable to update the expense.'

            });

          }

        });


      return;

    }


    // ===================================================
    // CREATE NEW EXPENSE
    // ===================================================

    this.expenseService
      .saveExpense(request)
      .subscribe({

        next: () => {

          this.loading = false;

          this.addCustomCategory(finalCategory);


          Swal.fire({

            icon: 'success',

            title: 'Expense Saved!',

            text:
              'The expense has been saved successfully.',

            timer: 1500,

            showConfirmButton: false

          });


          this.router.navigate([
            '/expenses'
          ]);

        },


        error: (error) => {

          console.error(
            'Error saving expense:',
            error
          );

          this.loading = false;


          Swal.fire({

            icon: 'error',

            title: 'Save Failed',

            text:
              'Unable to save the expense.'

          });

        }

      });

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/expenses'
    ]);

  }

}