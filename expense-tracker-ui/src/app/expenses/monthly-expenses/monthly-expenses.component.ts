import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ExpenseService } from '../expense.service';
import { MonthlyStatistics } from '../../models/monthly-statistics';

@Component({
  selector: 'app-monthly-expenses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monthly-expenses.component.html',
  styleUrl: './monthly-expenses.component.css'
})
export class MonthlyExpensesComponent implements OnInit {

  monthlyStatistics: MonthlyStatistics[] = [];

  loading = false;

  constructor(
    private expenseService: ExpenseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMonthlyStatistics();
  }

  loadMonthlyStatistics(): void {

    this.loading = true;

    this.expenseService.getMonthlyStatistics().subscribe({

      next: (response) => {

        this.monthlyStatistics = response;

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

  getMonthName(month: number): string {

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

    return months[month - 1];

  }

  openMonth(stat: MonthlyStatistics): void {

    this.router.navigate(
      ['/expenses/monthly', stat.year, stat.month]
    );

  }

  goBack(): void {

    this.router.navigate(['/expenses']);

  }

}