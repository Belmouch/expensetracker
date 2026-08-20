import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Budget } from '../models/budget.model';
import { BudgetService } from '../services/budget.service';

@Component({
  selector: 'app-budget-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './budget-management.component.html',
  styleUrl: './budget-management.component.css'
})
export class BudgetManagementComponent implements OnInit {

  budgets: Budget[] = [];

  loading = false;
  errorMessage = '';

  constructor(
    private budgetService: BudgetService
  ) {}

  ngOnInit(): void {
    this.loadBudgets();
  }


  // =========================================================
  // LOAD BUDGETS OF CONNECTED USER
  // =========================================================

  loadBudgets(): void {

    this.loading = true;
    this.errorMessage = '';

    this.budgetService.getMyBudgets().subscribe({

      next: (data) => {

        console.log('MY BUDGETS:', data);

        this.budgets = data;

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
  // DELETE BUDGET
  // =========================================================

  deleteBudget(id: number): void {

    this.budgetService.deleteBudget(id).subscribe({

      next: () => {

        console.log(
          'Budget deleted:',
          id
        );

        this.loadBudgets();
      },

      error: (error) => {

        console.error(
          'Error deleting budget:',
          error
        );

        this.errorMessage =
          'Unable to delete budget.';
      }

    });
  }

}