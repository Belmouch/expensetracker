import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Expense } from '../../models/expense';

@Component({
  selector: 'app-expense-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-details-modal.component.html',
  styleUrl: './expense-details-modal.component.css'
})
export class ExpenseDetailsModalComponent {
  @Input() expenses: Expense[] = [];
  @Input() mode: 'category' | 'date' = 'date';
  @Input() selectedCategory = '';
  @Input() selectedDate = '';
  @Input() monthLabel = '';

  @Output() closed = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<Expense>();
  @Output() deleteRequested = new EventEmitter<Expense>();

  get title(): string {
    return this.mode === 'category'
      ? `Expenses - ${this.selectedCategory}`
      : `Expenses - ${this.formatFullDate(this.selectedDate)}`;
  }

  get subtitle(): string {
    return this.mode === 'category'
      ? `All expenses in the ${this.selectedCategory} category for ${this.monthLabel}.`
      : `All expenses on ${this.formatFullDate(this.selectedDate)}.`;
  }

  get total(): number {
    return this.expenses.reduce((sum, expense) => sum + this.safeAmount(expense.amount), 0);
  }

  get emptyMessage(): string {
    return this.mode === 'date' ? 'No expenses for this day.' : 'No expenses found';
  }

  formatAmount(amount: number): string {
    return this.safeAmount(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatExpenseDate(date: string): string {
    return this.formatFullDate(date);
  }

  private formatFullDate(value: string): string {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? 'Unknown date'
      : date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
  }

  private safeAmount(amount: number): number {
    return Number.isFinite(Number(amount)) && Number(amount) > 0 ? Number(amount) : 0;
  }
}
