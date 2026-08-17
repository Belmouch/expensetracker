import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { ExpenseListComponent } from './expenses/expense-list/expense-list.component';
import { AddExpenseComponent } from './expenses/add-expense/add-expense.component';
import { authGuard } from './auth/auth.guard';
import { MonthlyExpensesComponent } from './expenses/monthly-expenses/monthly-expenses.component';
import { MonthlyDetailsComponent } from './expenses/monthly-details/monthly-details.component';
export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: LoginComponent
  },
  {
  path: 'expenses',
  component: ExpenseListComponent,
  canActivate: [authGuard]
},
{
  path: 'expenses/add',
  component: AddExpenseComponent,
  canActivate: [authGuard]
},
{
  path: 'expenses/edit/:id',
  component: AddExpenseComponent,
  canActivate: [authGuard]
},
{
  path: 'expenses/monthly/:year/:month',
  component: MonthlyDetailsComponent,
  canActivate: [authGuard]
},
{
  path: 'expenses/monthly',
  component: MonthlyExpensesComponent,
  canActivate: [authGuard]
},
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]
},
{
  path: 'register',
  loadComponent: () =>
    import('./auth/register/register.component')
      .then(m => m.RegisterComponent)
}

  



];