import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { ExpenseListComponent } from './expenses/expense-list/expense-list.component';
import { AddExpenseComponent } from './expenses/add-expense/add-expense.component';

import { authGuard } from './auth/auth.guard';

import { MonthlyExpensesComponent } from './expenses/monthly-expenses/monthly-expenses.component';
import { MonthlyDetailsComponent } from './expenses/monthly-details/monthly-details.component';

import { LayoutComponent } from './layout/layout.component';
import { BudgetManagementComponent } from './budget/budget-management.component';

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

            // =========================
            // DASHBOARD
            // =========================

            {
                path: 'dashboard',
                component: DashboardComponent
            },

            // =========================
            // EXPENSES
            // =========================

            {
                path: 'expenses',
                component: ExpenseListComponent
            },

            // =========================
            // ADD EXPENSE
            // =========================

            {
                path: 'expenses/add',
                component: AddExpenseComponent
            },

            // =========================
            // EDIT EXPENSE
            // =========================

            {
                path: 'expenses/edit/:id',
                component: AddExpenseComponent
            },

            // =========================
            // MONTHLY EXPENSES
            // =========================

            {
                path: 'expenses/monthly',
                component: MonthlyExpensesComponent
            },

            // =========================
            // MONTHLY DETAILS
            // =========================

            {
                path: 'expenses/monthly/:year/:month',
                component: MonthlyDetailsComponent
            },

            // =========================
            // BUDGET
            // =========================

            {
                path: 'budget',
                component: BudgetManagementComponent
            }

        ]
    }

];