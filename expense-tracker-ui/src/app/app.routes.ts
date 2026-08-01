import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { ExpenseListComponent } from './expenses/expense-list/expense-list.component';
import { AddExpenseComponent } from './expenses/add-expense/add-expense.component';

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
    component: ExpenseListComponent
  },

  {
    path: 'expenses/add',
    component: AddExpenseComponent
  }

];