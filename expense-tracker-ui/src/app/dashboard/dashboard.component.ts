import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import {
  ChartConfiguration,
  ChartData,
  ChartType
} from 'chart.js';

import { Router } from '@angular/router';

import { ExpenseService } from '../expenses/expense.service';
import { Expense } from '../models/expense';
import { MonthlyStatistics } from '../models/monthly-statistics';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgChartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  statistics: any = null;

  monthlyStatistics: MonthlyStatistics[] = [];

  recentExpenses: Expense[] = [];

  loading = true;

  errorMessage = '';

  // =========================
  // PIE CHART
  // =========================

  public pieChartType: ChartType = 'doughnut';

  public pieChartData: ChartData<'doughnut', number[], string> = {
    labels: [],
    datasets: [
      {
        data: []
      }
    ]
  };

  public pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {

    responsive: true,

    maintainAspectRatio: false,

    cutout: '65%',

    plugins: {

      legend: {
        display: false
      },

      tooltip: {

        callbacks: {

          label: (context) => {

            const label = context.label || '';

            const value = Number(context.parsed);

            const data =
              context.dataset.data as number[];

            const total =
              data.reduce(
                (sum, current) =>
                  sum + Number(current),
                0
              );

            const percentage =
              total > 0
                ? ((value / total) * 100).toFixed(1)
                : '0';

            return `${label}: ${value} expenses (${percentage}%)`;
          }

        }

      }

    }

  };


  constructor(
    private expenseService: ExpenseService,
    private router: Router
  ) { }
  goToExpenses(): void {
    this.router.navigate(['/expenses']);
  }

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.loadDashboard();

  }


  // =========================
  // LOAD DASHBOARD
  // =========================

  loadDashboard(): void {

    this.loading = true;

    this.errorMessage = '';

    this.expenseService
      .getStatistics()
      .subscribe({

        next: (data) => {

          this.statistics = data;

          this.prepareCategoryChart(data);

          this.loadMonthlyStatistics();

          this.loadRecentExpenses();

        },

        error: (error) => {

          console.error(
            'Error loading dashboard:',
            error
          );

          this.loading = false;

          this.errorMessage =
            'Unable to load dashboard statistics. Please try again.';

        }

      });

  }


  // =========================
  // RECENT EXPENSES
  // =========================

  loadRecentExpenses(): void {

    this.expenseService
      .getExpenses(
        0,
        5,
        '',
        undefined,
        undefined
      )
      .subscribe({

        next: (response) => {

          this.recentExpenses =
            response.content || [];

        },

        error: (error) => {

          console.error(
            'Error loading recent expenses:',
            error
          );

          this.recentExpenses = [];

        }

      });

  }


  // =========================
  // CATEGORY CHART
  // =========================

  prepareCategoryChart(data: any): void {

    const categoryCounts: {
      [key: string]: number
    } = {};


    if (
      data &&
      data.categories &&
      Array.isArray(data.categories)
    ) {

      data.categories.forEach(
        (category: any) => {

          if (!category.category) {
            return;
          }

          const normalized =
            category.category
              .trim()
              .toLowerCase();


          const displayName =
            normalized.charAt(0).toUpperCase()
            + normalized.slice(1);


          categoryCounts[displayName] =
            (
              categoryCounts[displayName] || 0
            )
            + Number(category.count);

        }
      );

    }


    this.pieChartData = {

      labels:
        Object.keys(categoryCounts),

      datasets: [

        {

          data:
            Object.values(categoryCounts)

        }

      ]

    };

  }


  // =========================
  // MONTHLY STATISTICS
  // =========================

  loadMonthlyStatistics(): void {

    this.expenseService
      .getMonthlyStatistics()
      .subscribe({

        next: (data) => {

          this.monthlyStatistics =
            data || [];

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Error loading monthly statistics:',
            error
          );

          this.loading = false;

        }

      });

  }


  // =========================
  // TOTAL AMOUNT
  // =========================

  get totalAmount(): number {

    return this.statistics?.totalAmount ?? 0;

  }


  // =========================
  // THIS MONTH AMOUNT
  // =========================

  get currentMonthAmount(): number {

    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      now.getMonth() + 1;


    const current =
      this.monthlyStatistics.find(
        item =>
          Number(item.year) === year &&
          Number(item.month) === month
      );


    return current?.total ?? 0;

  }


  // =========================
  // TOTAL EXPENSES
  // =========================

  get totalExpenses(): number {

    return this.statistics?.totalExpenses ?? 0;

  }


  // =========================
  // THIS MONTH EXPENSES
  // =========================

  get currentMonthExpenses(): number {

    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      now.getMonth() + 1;


    const current =
      this.monthlyStatistics.find(
        item =>
          Number(item.year) === year &&
          Number(item.month) === month
      );


    return current?.count ?? 0;

  }


  // =========================
  // CATEGORIES
  // =========================

  get categories(): any[] {

    if (
      !this.statistics?.categories
    ) {

      return [];

    }


    const grouped: {
      [key: string]: number
    } = {};


    this.statistics.categories.forEach(
      (category: any) => {

        if (!category.category) {
          return;
        }

        const name =
          category.category
            .trim()
            .toLowerCase();


        const displayName =
          name.charAt(0).toUpperCase()
          + name.slice(1);


        grouped[displayName] =
          (
            grouped[displayName] || 0
          )
          + Number(category.count);

      }
    );


    return Object.entries(grouped)

      .sort(
        (a, b) =>
          b[1] - a[1]
      )

      .map(
        ([name, count]) => ({
          name,
          count
        })
      );

  }


  // =========================
  // CATEGORY PERCENTAGE
  // =========================

  getCategoryPercentage(
    count: number
  ): number {

    const total =
      this.categories.reduce(
        (sum, category) =>
          sum + category.count,
        0
      );


    if (!total) {
      return 0;
    }


    return Math.round(
      (count / total) * 100
    );

  }


  // =========================
  // MONTH NAME
  // =========================

  getMonthName(
    month: number
  ): string {

    const months = [

      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'

    ];


    return months[month - 1] || '';

  }


  // =========================
  // RECENT MONTHS
  // =========================

  get recentMonths(): MonthlyStatistics[] {

    return this.monthlyStatistics
      .slice(0, 5);

  }

}