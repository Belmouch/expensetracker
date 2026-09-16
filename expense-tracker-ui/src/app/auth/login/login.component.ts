import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AuthService } from '../auth.service';
import { LoginRequest } from '../../models/login-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username = '';
  password = '';
  showPassword = false;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {

    if (this.loading) {
      return;
    }

    if (!this.username.trim() || !this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing information',
        text: 'Please enter your username and password.',
        confirmButtonText: 'OK'
      });

      return;
    }

    const request: LoginRequest = {
      username: this.username,
      password: this.password
    };

    this.loading = true;

    this.authService.login(request).subscribe({

      next: (token) => {

        localStorage.setItem('token', token);

        Swal.fire({
          icon: 'success',
          title: 'Welcome!',
          text: 'Login successful.',
          timer: 1200,
          showConfirmButton: false
        });

        this.router.navigate(['/expenses']);
      },

      error: (error: HttpErrorResponse) => {

        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: this.getLoginErrorMessage(error),
          confirmButtonText: 'Try again'
        });

      }

    }).add(() => this.loading = false);
  }

  private getLoginErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 401 || error.status === 403) {
      return 'Invalid username or password.';
    }

    if (error.status === 500) {
      return 'Server error. Please try again later.';
    }

    if (error.status === 0) {
      return 'Unable to connect to the server. Please try again.';
    }

    return 'Unable to sign in. Please try again.';
  }
}