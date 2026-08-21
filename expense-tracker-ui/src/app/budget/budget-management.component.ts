import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';

import {
  Budget,
  BudgetRequest
} from '../models/budget.model';

import { BudgetService } from '../services/budget.service';

import { BudgetDetailsComponent } from './budget-details/budget-details.component';


@Component({
  selector: 'app-budget-management',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    BudgetDetailsComponent
  ],

  templateUrl: './budget-management.component.html',

  styleUrl: './budget-management.component.css'
})
export class BudgetManagementComponent implements OnInit {

  // =========================================================
  // DATA
  // =========================================================

  budgets: Budget[] = [];

  loading = false;

  saving = false;

  errorMessage = '';

  formError = '';


  // =========================================================
  // BUDGET DETAILS
  // =========================================================

  selectedBudget: Budget | null = null;


  /**
   * Expose Math to the Angular template.
   * Useful for Math.min() / Math.max().
   */
  readonly Math = Math;


  toggleBudgetDetails(budget: Budget): void {

    if (this.selectedBudget?.id === budget.id) {

      this.selectedBudget = null;

      return;
    }

    this.selectedBudget = budget;
  }


  closeBudgetDetails(): void {

    this.selectedBudget = null;
  }


  // =========================================================
  // CATEGORIES
  // =========================================================

  categories = [

    {
      name: 'Food',
      icon: 'bi-egg-fried'
    },

    {
      name: 'Shopping',
      icon: 'bi-bag'
    },

    {
      name: 'Coffee',
      icon: 'bi-cup-hot'
    },

    {
      name: 'Bills',
      icon: 'bi-receipt'
    },

    {
      name: 'Water',
      icon: 'bi-droplet'
    },

    {
      name: 'Entertainment',
      icon: 'bi-controller'
    },

    {
      name: 'Study',
      icon: 'bi-book'
    },

    {
      name: 'Transport',
      icon: 'bi-car-front'
    },

    {
      name: 'Health',
      icon: 'bi-heart-pulse'
    },

    {
      name: 'Other',
      icon: 'bi-three-dots'
    }

  ];


  categoryDropdownOpen = false;

  customCategory = '';


  // =========================================================
  // MODAL
  // =========================================================

  showForm = false;

  editingBudget: Budget | null = null;


  // =========================================================
  // FORM DATA
  // =========================================================

  budgetFormData: BudgetRequest = {

    amount: 0,

    category: '',

    startDate: '',

    endDate: ''

  };


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private budgetService: BudgetService
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadBudgets();
  }


  // =========================================================
  // STATISTICS
  // =========================================================

  get totalBudget(): number {

    return this.budgets.reduce(
      (total, budget) =>
        total + budget.amount,
      0
    );
  }


  get totalSpent(): number {

    return this.budgets.reduce(
      (total, budget) =>
        total + budget.spent,
      0
    );
  }


  get totalRemaining(): number {

    return this.budgets.reduce(
      (total, budget) =>
        total + budget.remaining,
      0
    );
  }


  // =========================================================
  // LOAD BUDGETS
  // =========================================================

  loadBudgets(): void {

    this.loading = true;

    this.errorMessage = '';


    this.budgetService
      .getMyBudgets()
      .subscribe({

        next: (data: Budget[]) => {

          console.log(
            'MY BUDGETS:',
            data
          );

          this.budgets = data;

          /*
           * If the currently opened budget
           * was deleted, close details.
           */
          if (
            this.selectedBudget &&
            !this.budgets.some(
              budget =>
                budget.id === this.selectedBudget?.id
            )
          ) {

            this.selectedBudget = null;
          }

          this.loading = false;
        },


        error: (error) => {

          console.error(
            'Error loading budgets:',
            error
          );

          this.errorMessage =
            'Unable to load budgets.';

          this.loading = false;
        }

      });
  }


  // =========================================================
  // CATEGORY DROPDOWN
  // =========================================================

  toggleCategoryDropdown(): void {

    this.categoryDropdownOpen =
      !this.categoryDropdownOpen;
  }


  // =========================================================
  // SELECT CATEGORY
  // =========================================================

  selectCategory(category: string): void {

    this.budgetFormData.category =
      category;

    this.formError = '';


    if (category === 'Other') {

      this.customCategory = '';

      this.categoryDropdownOpen = false;

      return;
    }


    this.customCategory = '';

    this.categoryDropdownOpen = false;
  }


  // =========================================================
  // GET SELECTED CATEGORY ICON
  // =========================================================

  getSelectedCategoryIcon(): string {

    const selected =
      this.categories.find(
        category =>
          category.name ===
          this.budgetFormData.category
      );


    return selected?.icon
      ?? 'bi-three-dots';
  }


  // =========================================================
  // OPEN CREATE FORM
  // =========================================================

  openCreateForm(): void {

    this.editingBudget = null;

    this.formError = '';

    this.customCategory = '';

    this.categoryDropdownOpen = false;


    this.budgetFormData = {

      amount: 0,

      category: '',

      startDate: '',

      endDate: ''

    };


    this.showForm = true;
  }


  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  openEditForm(
    budget: Budget
  ): void {

    this.editingBudget = budget;

    this.formError = '';

    this.customCategory = '';

    this.categoryDropdownOpen = false;


    /*
     * Check if category is predefined.
     */

    const predefinedCategory =
      this.categories.some(
        category =>
          category.name === budget.category &&
          category.name !== 'Other'
      );


    if (predefinedCategory) {

      this.budgetFormData = {

        amount: budget.amount,

        category: budget.category,

        startDate: budget.startDate,

        endDate: budget.endDate

      };

    } else {

      /*
       * Custom category.
       */

      this.budgetFormData = {

        amount: budget.amount,

        category: 'Other',

        startDate: budget.startDate,

        endDate: budget.endDate

      };


      this.customCategory =
        budget.category;
    }


    this.showForm = true;
  }


  // =========================================================
  // CLOSE FORM
  // =========================================================

  closeBudgetForm(): void {

    if (this.saving) {

      return;
    }


    this.showForm = false;

    this.editingBudget = null;

    this.formError = '';

    this.customCategory = '';

    this.categoryDropdownOpen = false;
  }


  // =========================================================
  // SUBMIT FORM
  // =========================================================

  submitBudget(): void {

    this.formError = '';


    // =======================================================
    // CATEGORY
    // =======================================================

    let finalCategory =
      this.budgetFormData.category.trim();


    /*
     * If "Other" is selected,
     * use the custom category.
     */

    if (finalCategory === 'Other') {

      finalCategory =
        this.customCategory.trim();


      if (!finalCategory) {

        this.formError =
          'Please enter your category.';

        return;
      }
    }


    // =======================================================
    // CATEGORY VALIDATION
    // =======================================================

    if (!finalCategory) {

      this.formError =
        'Category is required.';

      return;
    }


    // =======================================================
    // AMOUNT VALIDATION
    // =======================================================

    if (
      !this.budgetFormData.amount ||
      this.budgetFormData.amount <= 0
    ) {

      this.formError =
        'Amount must be greater than 0.';

      return;
    }


    // =======================================================
    // DATE VALIDATION
    // =======================================================

    if (
      !this.budgetFormData.startDate ||
      !this.budgetFormData.endDate
    ) {

      this.formError =
        'Start date and end date are required.';

      return;
    }


    // =======================================================
    // DATE ORDER
    // =======================================================

    if (
      this.budgetFormData.endDate <
      this.budgetFormData.startDate
    ) {

      this.formError =
        'End date cannot be before start date.';

      return;
    }


    // =======================================================
    // REQUEST
    // =======================================================

    const request: BudgetRequest = {

      amount:
        this.budgetFormData.amount,

      category:
        finalCategory,

      startDate:
        this.budgetFormData.startDate,

      endDate:
        this.budgetFormData.endDate

    };


    console.log(
      'BUDGET REQUEST:',
      request
    );


    // =======================================================
    // START SAVING
    // =======================================================

    this.saving = true;


    // =======================================================
    // UPDATE
    // =======================================================

    if (this.editingBudget) {

      this.budgetService
        .updateBudget(
          this.editingBudget.id,
          request
        )
        .subscribe({

          next: (updatedBudget) => {

            console.log(
              'Budget updated:',
              updatedBudget
            );


            this.saving = false;

            this.closeBudgetForm();

            this.loadBudgets();


            Swal.fire({

              title: 'Updated!',

              text:
                'Budget updated successfully.',

              icon: 'success',

              confirmButtonColor:
                '#198754',

              timer: 1800,

              showConfirmButton: false

            });

          },


          error: (error) => {

            console.error(
              'Error updating budget:',
              error
            );


            this.formError =
              error?.error?.message ||
              'Unable to update budget.';


            this.saving = false;
          }

        });


      return;
    }


    // =======================================================
    // CREATE
    // =======================================================

    this.budgetService
      .createBudget(request)
      .subscribe({

        next: (createdBudget) => {

          console.log(
            'Budget created:',
            createdBudget
          );


          this.saving = false;

          this.closeBudgetForm();

          this.loadBudgets();


          Swal.fire({

            title: 'Created!',

            text:
              'Budget created successfully.',

            icon: 'success',

            confirmButtonColor:
              '#198754',

            timer: 1800,

            showConfirmButton: false

          });

        },


        error: (error) => {

          console.error(
            'Error creating budget:',
            error
          );


          this.formError =
            error?.error?.message ||
            'Unable to create budget.';


          this.saving = false;
        }

      });
  }


  // =========================================================
  // CONFIRM EDIT
  // =========================================================

  confirmEditBudget(
    budget: Budget
  ): void {

    Swal.fire({

      title: 'Edit Budget?',

      text:
        `You are about to edit the "${budget.category}" budget.`,

      icon: 'question',

      showCancelButton: true,

      confirmButtonText:
        'Yes, edit',

      cancelButtonText:
        'Cancel',

      confirmButtonColor:
        '#198754',

      cancelButtonColor:
        '#6c757d',

      reverseButtons: true

    }).then((result) => {

      if (result.isConfirmed) {

        this.openEditForm(budget);
      }

    });
  }


  // =========================================================
  // DELETE
  // =========================================================

  deleteBudget(
    id: number
  ): void {

    Swal.fire({

      title: 'Delete Budget?',

      text:
        'This action cannot be undone.',

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText:
        'Yes, delete it',

      cancelButtonText:
        'Cancel',

      confirmButtonColor:
        '#dc3545',

      cancelButtonColor:
        '#6c757d',

      reverseButtons: true,

      buttonsStyling: true

    }).then((result) => {

      if (!result.isConfirmed) {

        return;
      }


      this.budgetService
        .deleteBudget(id)
        .subscribe({

          next: () => {

            /*
             * Close details if the deleted
             * budget was currently selected.
             */

            if (
              this.selectedBudget?.id === id
            ) {

              this.selectedBudget = null;
            }


            this.loadBudgets();


            Swal.fire({

              title: 'Deleted!',

              text:
                'Budget deleted successfully.',

              icon: 'success',

              confirmButtonColor:
                '#198754',

              timer: 1800,

              showConfirmButton: false

            });

          },


          error: (error) => {

            console.error(
              'Error deleting budget:',
              error
            );


            Swal.fire({

              title: 'Error',

              text:
                'Unable to delete budget.',

              icon: 'error',

              confirmButtonColor:
                '#dc3545'

            });

          }

        });

    });
  }

}