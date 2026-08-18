import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { ExpenseListComponent } from './expenses/expense-list/expense-list.component';
import { AddExpenseComponent } from './expenses/add-expense/add-expense.component';

import { authGuard } from './auth/auth.guard';

import { MonthlyExpensesComponent } from './expenses/monthly-expenses/monthly-expenses.component';
import { MonthlyDetailsComponent } from './expenses/monthly-details/monthly-details.component';

import { LayoutComponent } from './layout/layout.component';


export const routes: Routes = [

    // =========================
    // DEFAULT
    // =========================

    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },


    // =========================
    // AUTH
    // =========================

    {
        path: 'login',
        component: LoginComponent
    },

    {
        path: 'register',
        loadComponent: () =>
            import('./auth/register/register.component')
                .then(m => m.RegisterComponent)
    },


    // =========================
    // PROTECTED APP
    // =========================

    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],

        children: [

            // Dashboard

            {
                path: 'dashboard',
                component: DashboardComponent
            },


            // Expenses

            {
                path: 'expenses',
                component: ExpenseListComponent
            },


            // Add

            {
                path: 'expenses/add',
                component: AddExpenseComponent
            },


            // Edit

            {
                path: 'expenses/edit/:id',
                component: AddExpenseComponent
            },


            // Monthly

            {
                path: 'expenses/monthly',
                component: MonthlyExpensesComponent
            },


            // Monthly details

            {
                path: 'expenses/monthly/:year/:month',
                component: MonthlyDetailsComponent
            }

        ]

    }

];