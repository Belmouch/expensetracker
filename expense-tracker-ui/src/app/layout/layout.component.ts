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

    username = '';

    constructor(
        private expenseService: ExpenseService,
        private router: Router
    ) {

        this.username = this.expenseService.getUsername();

    }

    logout(): void {

        Swal.fire({
            title: 'Logout?',
            text: 'Are you sure you want to logout?',
            icon: 'question',

            showCancelButton: true,

            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel',

            confirmButtonColor: '#198754',
            cancelButtonColor: '#dc3545',

            reverseButtons: true
        }).then((result) => {

            if (result.isConfirmed) {

                this.expenseService.logout();

                this.router.navigate(['/login']);

            }

        });

    }
    sidebarOpen = true;

    toggleSidebar(): void {
        this.sidebarOpen = !this.sidebarOpen;
    }

}