import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ActiveElement, ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { Observable, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';

import { ExpenseService } from '../expenses/expense.service';
import { Expense } from '../models/expense';
import { ExpenseDetailsModalComponent } from '../shared/expense-details-modal/expense-details-modal.component';

interface CategorySummary {
  name: string;
  total: number;
  percentage: number;
}

interface DailySummary {
  day: number;
  total: number;
}

@Component({
  selector: 'app-financial-insights',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, RouterModule, ExpenseDetailsModalComponent],
  templateUrl: './financial-insights.component.html',
  styleUrl: './financial-insights.component.css'
})
export class FinancialInsightsComponent implements OnInit {
  selectedMonth = this.toMonthInputValue(new Date());
  loading = true;
  errorMessage = '';

  expenses: Expense[] = [];
  previousExpenses: Expense[] = [];
  categorySummaries: CategorySummary[] = [];
  dailySummaries: DailySummary[] = [];

  totalSpending = 0;
  averageDailySpending = 0;
  highestSpendingDay: DailySummary | null = null;
  topCategory: CategorySummary | null = null;
  previousTotal = 0;
  spendingDifference = 0;
  spendingChangePercentage: number | null = null;

  modalFilter: 'category' | 'date' | null = null;
  selectedCategory = '';
  selectedDate = '';

  readonly doughnutChartType: ChartType = 'doughnut';
  readonly lineChartType: ChartType = 'line';
  readonly chartPalette = [
    '#168b59',
    '#3456a5',
    '#e28a2b',
    '#b554c5',
    '#1a9bb5',
    '#d45d5d',
    '#7b8b3e',
    '#8c62b8'
  ];

  doughnutChartData: ChartData<'doughnut', number[], string> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: this.chartPalette }]
  };

  readonly doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${this.formatAmount(Number(context.parsed))} DH`
        }
      }
    }
  };

  lineChartData: ChartData<'line', number[], string> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Daily spending',
      borderColor: '#168b59',
      backgroundColor: 'rgba(22, 139, 89, 0.12)',
      pointBackgroundColor: '#168b59',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: true,
      tension: 0.35
    }]
  };

  readonly lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => {
            const day = Number(items[0]?.label);
            return Number.isFinite(day) ? this.formatDate(day) : '';
          },
          label: (context) => `${this.formatAmount(Number(context.parsed.y))} DH`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 10 }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value} DH`
        }
      }
    }
  };

  private readonly monthCache = new Map<string, Expense[]>();

  constructor(
    private readonly expenseService: ExpenseService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadInsights();
  }

  loadInsights(forceRefresh = false): void {
    const selected = this.parseMonth(this.selectedMonth);
    const previous = new Date(selected.year, selected.month - 2, 1);
    const selectedKey = this.monthKey(selected.year, selected.month);
    const previousKey = this.monthKey(previous.getFullYear(), previous.getMonth() + 1);

    this.loading = true;
    this.errorMessage = '';

    const selectedRequest = this.getMonthExpenses(
      selected.year,
      selected.month,
      selectedKey,
      forceRefresh
    );
    const previousRequest = this.getMonthExpenses(
      previous.getFullYear(),
      previous.getMonth() + 1,
      previousKey,
      forceRefresh
    );

    forkJoin({ selected: selectedRequest, previous: previousRequest }).subscribe({
      next: ({ selected: expenses, previous: previousExpenses }) => {
        this.expenses = expenses;
        this.previousExpenses = previousExpenses;
        this.calculateInsights(selected.year, selected.month);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading financial insights:', error);
        this.loading = false;
        this.errorMessage = 'Unable to load financial insights.';
      }
    });
  }

  onMonthChange(): void {
    if (/^\d{4}-\d{2}$/.test(this.selectedMonth)) {
      this.loadInsights();
    }
  }

  refresh(): void {
    this.loadInsights(true);
  }

  onCategoryChartClick(event: { active?: ActiveElement[] }): void {
    const index = event.active?.[0]?.index;
    const category = typeof index === 'number'
      ? this.categorySummaries[index]?.name
      : undefined;

    if (category) {
      this.openCategoryExpenses(category);
    }
  }

  onDayChartClick(event: { active?: ActiveElement[] }): void {
    const index = event.active?.[0]?.index;
    const day = typeof index === 'number' ? this.dailySummaries[index]?.day : undefined;

    if (day) {
      this.openDayExpenses(day);
    }
  }

  openCategoryExpenses(category: string): void {
    this.modalFilter = 'category';
    this.selectedCategory = category;
    this.selectedDate = '';
  }

  openDayExpenses(day: number): void {
    const { year, month } = this.parseMonth(this.selectedMonth);
    this.modalFilter = 'date';
    this.selectedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    this.selectedCategory = '';
  }

  closeExpenseModal(): void {
    this.modalFilter = null;
    this.selectedCategory = '';
    this.selectedDate = '';
  }

  get modalExpenses(): Expense[] {
    if (this.modalFilter === 'category') {
      const category = this.normalize(this.selectedCategory);
      return this.expenses.filter(expense =>
        this.validExpense(expense) && this.normalize(expense.category) === category
      );
    }

    if (this.modalFilter === 'date') {
      return this.expenses.filter(expense =>
        this.validExpense(expense) && expense.date === this.selectedDate
      );
    }

    return [];
  }

  get modalTotal(): number {
    return this.sumExpenses(this.modalExpenses);
  }

  get modalTitle(): string {
    return this.modalFilter === 'category'
      ? `Expenses - ${this.selectedCategory}`
      : `Expenses - ${this.formatFullDate(this.selectedDate)}`;
  }

  get modalSubtitle(): string {
    return this.modalFilter === 'category'
      ? `All expenses in the ${this.selectedCategory} category for ${this.formatMonth()}.`
      : `All expenses on ${this.formatFullDate(this.selectedDate)}.`;
  }

  formatExpenseDate(date: string): string {
    return this.formatFullDate(date);
  }

  editExpense(expense: Expense): void {
    this.closeExpenseModal();
    this.router.navigate(['/expenses/edit', expense.id]);
  }

  deleteExpense(expense: Expense): void {
    Swal.fire({
      title: 'Delete Expense?',
      text: 'You will not be able to recover this expense!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (!result.isConfirmed) {
        return;
      }

      this.expenseService.deleteExpense(expense.id).subscribe({
        next: () => {
          this.expenses = this.expenses.filter(item => item.id !== expense.id);
          const selected = this.parseMonth(this.selectedMonth);
          this.monthCache.set(this.monthKey(selected.year, selected.month), this.expenses);
          this.calculateInsights(selected.year, selected.month);

          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Expense deleted successfully.',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: error => {
          console.error('Error deleting expense:', error);
          Swal.fire({
            icon: 'error',
            title: 'Delete failed',
            text: 'Unable to delete the expense.'
          });
        }
      });
    });
  }

  formatAmount(amount: number): string {
    return this.safeAmount(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatMonth(): string {
    const { year, month } = this.parseMonth(this.selectedMonth);
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }

  formatDate(day: number): string {
    const { year, month } = this.parseMonth(this.selectedMonth);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
  }

  get hasExpenses(): boolean {
    return this.expenses.some(expense => this.validExpense(expense));
  }

  get comparisonDirection(): 'increased' | 'decreased' | 'unchanged' {
    if (this.spendingDifference > 0) {
      return 'increased';
    }
    if (this.spendingDifference < 0) {
      return 'decreased';
    }
    return 'unchanged';
  }

  get comparisonMessage(): string {
    if (this.spendingChangePercentage === null) {
      return this.previousTotal === 0 && this.totalSpending > 0
        ? 'There is no previous-month baseline for a percentage comparison.'
        : 'There is no spending difference compared with last month.';
    }

    return `Your spending ${this.comparisonDirection} by ${this.formatAmount(Math.abs(this.spendingChangePercentage))}% compared with last month.`;
  }

  private calculateInsights(year: number, month: number): void {
    const validExpenses = this.expenses.filter(expense => this.validExpense(expense));
    this.totalSpending = this.sumExpenses(validExpenses);
    this.averageDailySpending = this.totalSpending / new Date(year, month, 0).getDate();
    this.categorySummaries = this.calculateCategorySummaries(validExpenses);
    this.topCategory = this.categorySummaries[0] ?? null;
    this.dailySummaries = this.calculateDailySummaries(validExpenses, year, month);
    this.highestSpendingDay = this.dailySummaries.reduce<DailySummary | null>(
      (highest, current) => !highest || current.total > highest.total ? current : highest,
      null
    );
    this.previousTotal = this.sumExpenses(this.previousExpenses.filter(expense => this.validExpense(expense)));
    this.spendingDifference = this.totalSpending - this.previousTotal;
    this.spendingChangePercentage = this.previousTotal > 0
      ? (this.spendingDifference / this.previousTotal) * 100
      : null;

    this.doughnutChartData = {
      labels: this.categorySummaries.map(summary => summary.name),
      datasets: [{
        data: this.categorySummaries.map(summary => summary.total),
        backgroundColor: this.chartPalette
      }]
    };

    this.lineChartData = {
      labels: this.dailySummaries.map(summary => String(summary.day)),
      datasets: [{
        ...this.lineChartData.datasets[0],
        data: this.dailySummaries.map(summary => summary.total)
      }]
    };
  }

  private calculateCategorySummaries(expenses: Expense[]): CategorySummary[] {
    const totals = new Map<string, number>();

    expenses.forEach(expense => {
      const category = this.displayCategory(expense.category);
      totals.set(category, (totals.get(category) ?? 0) + this.safeAmount(expense.amount));
    });

    return Array.from(totals.entries())
      .map(([name, total]) => ({
        name,
        total,
        percentage: this.totalSpending > 0 ? (total / this.totalSpending) * 100 : 0
      }))
      .sort((first, second) => second.total - first.total);
  }

  private calculateDailySummaries(expenses: Expense[], year: number, month: number): DailySummary[] {
    const daysInMonth = new Date(year, month, 0).getDate();
    const totals = new Map<number, number>();

    expenses.forEach(expense => {
      const day = Number(expense.date.slice(8, 10));
      if (day >= 1 && day <= daysInMonth) {
        totals.set(day, (totals.get(day) ?? 0) + this.safeAmount(expense.amount));
      }
    });

    return Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      total: totals.get(index + 1) ?? 0
    }));
  }

  private getMonthExpenses(
    year: number,
    month: number,
    key: string,
    forceRefresh: boolean
  ): Observable<Expense[]> {
    if (!forceRefresh && this.monthCache.has(key)) {
      return of(this.monthCache.get(key) ?? []);
    }

    return new Observable<Expense[]>(subscriber => {
      this.expenseService.getExpensesByMonth(year, month).subscribe({
        next: expenses => {
          const safeExpenses = Array.isArray(expenses) ? expenses : [];
          this.monthCache.set(key, safeExpenses);
          subscriber.next(safeExpenses);
          subscriber.complete();
        },
        error: error => subscriber.error(error)
      });
    });
  }

  private sumExpenses(expenses: Expense[]): number {
    return expenses.reduce((total, expense) => total + this.safeAmount(expense.amount), 0);
  }

  private safeAmount(amount: number): number {
    return Number.isFinite(Number(amount)) && Number(amount) > 0 ? Number(amount) : 0;
  }

  private validExpense(expense: Expense): boolean {
    return Boolean(expense && /^\d{4}-\d{2}-\d{2}/.test(expense.date) && this.safeAmount(expense.amount) > 0);
  }

  private displayCategory(category: string): string {
    const normalized = String(category ?? '').trim();
    return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Uncategorized';
  }

  private formatFullDate(value: string): string {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? 'Unknown date'
      : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  private normalize(value: string): string {
    return String(value ?? '').trim().toLowerCase();
  }

  private parseMonth(value: string): { year: number; month: number } {
    const [year, month] = value.split('-').map(Number);
    return { year: year || new Date().getFullYear(), month: month || new Date().getMonth() + 1 };
  }

  private monthKey(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
  }

  private toMonthInputValue(date: Date): string {
    return this.monthKey(date.getFullYear(), date.getMonth() + 1);
  }
}
