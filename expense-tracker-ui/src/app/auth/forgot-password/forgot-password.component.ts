import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: '../password-reset.css'
})
export class ForgotPasswordComponent {

  email = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  submit(): void {
    if (this.loading) {
      return;
    }

    if (!this.email.trim() || !this.isEmailValid()) {
      Swal.fire({
        icon: 'warning',
        title: 'Check your email',
        text: 'Please enter a valid email address.',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.loading = true;
    this.authService.forgotPassword({ email: this.email.trim() })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          window.sessionStorage.setItem('passwordResetEmail', this.email.trim());
          this.router.navigate(['/verify-code']);
        },
        error: (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: 'Unable to send code',
            text: this.getErrorMessage(error),
            confirmButtonText: 'Try again'
          });
        }
      });
  }

  private isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Unable to connect to the server. Please try again.';
    }
    return error.error?.message || 'Unable to send the verification code. Please try again.';
  }
}
