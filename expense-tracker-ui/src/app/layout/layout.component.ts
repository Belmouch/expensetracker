import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';

import {
  Router,
  RouterLink,
  RouterOutlet,
  RouterLinkActive
} from '@angular/router';

import { ExpenseService } from '../expenses/expense.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-layout',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],

  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

  // ==========================================
  // USER
  // ==========================================

  username = '';


  // ==========================================
  // SIDEBAR
  // ==========================================

  sidebarOpen = true;


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private expenseService: ExpenseService,
    private router: Router,

    // Theme service
    public themeService: ThemeService
  ) {

    this.username =
      this.expenseService.getUsername();

  }


  // ==========================================
  // SIDEBAR TOGGLE
  // ==========================================

  toggleSidebar(): void {

    this.sidebarOpen =
      !this.sidebarOpen;

  }


  // ==========================================
  // DARK / LIGHT MODE
  // ==========================================

  toggleTheme(): void {

    this.themeService.toggleTheme();

  }


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    Swal.fire({

      title: 'Logout?',

      text: 'Are you sure you want to logout?',

      icon: 'question',

      showCancelButton: true,

      confirmButtonText: 'Yes, logout',

      cancelButtonText: 'Cancel',

      confirmButtonColor: '#3456a5',

      cancelButtonColor: '#dc3545',

      reverseButtons: true

    }).then((result) => {

      if (result.isConfirmed) {

        this.expenseService.logout();

        this.router.navigate([
          '/login'
        ]);

      }

    });

  }

}