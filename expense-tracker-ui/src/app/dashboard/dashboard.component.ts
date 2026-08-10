import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import { ExpenseService } from '../expenses/expense.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  statistics: any;
  loading = true;
  errorMessage = '';

  // Pie Chart
  public pieChartType: ChartType = 'pie';

  public pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [
      {
        data: []
      }
    ]
  };

  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {

  responsive: true,

  plugins: {

    legend: {
      position: 'bottom'
    },

    tooltip: {
      callbacks: {

        label: (context) => {

          const label = context.label || '';
          const value = context.parsed;

          const data = context.dataset.data as number[];

          const total = data.reduce(
            (sum, current) => sum + current,
            0
          );

          const percentage = ((value / total) * 100).toFixed(1);

          return `${label}: ${value} expenses (${percentage}%)`;
        }

      }
    }

  }

};
  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }
loadStatistics(): void {

  this.loading = true;
  this.errorMessage = '';

  this.expenseService.getStatistics().subscribe({

    next: (data) => {

      console.log(data);

      this.statistics = data;

      // Normalize and group categories
      const categoryCounts: { [key: string]: number } = {};

      data.categories.forEach((category: any) => {

        const categoryName =
          category.category.trim().toLowerCase();

        const displayName =
          categoryName.charAt(0).toUpperCase() +
          categoryName.slice(1);

        categoryCounts[displayName] =
          (categoryCounts[displayName] || 0) + category.count;

      });

      // Prepare Pie Chart
      this.pieChartData = {
        labels: Object.keys(categoryCounts),

        datasets: [
          {
            data: Object.values(categoryCounts)
          }
        ]
      };

      this.loading = false;

    },

    error: (err) => {

      console.error(err);

      this.loading = false;

      this.errorMessage =
        'Unable to load dashboard statistics. Please try again.';

    }

  });

}
}