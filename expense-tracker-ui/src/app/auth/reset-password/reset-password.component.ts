import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: '../password-reset.css'
})
export class ResetPasswordComponent implements OnInit {

  resetToken = '';
  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.resetToken = typeof window !== 'undefined'
      ? window.sessionStorage.getItem('passwordResetToken') || ''
      : '';

    if (!this.resetToken) {
      this.router.navigate(['/forgot-password']);
    }
  }

  submit(): void {
    if (this.loading) {
      return;
    }

    if (this.newPassword.length < 8) {
      this.showValidation('Your new password must contain at least 8 characters.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showValidation('New password and confirmation do not match.');
      return;
    }

    this.loading = true;
    this.authService.resetPassword({
      resetToken: this.resetToken,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }).pipe(finalize(() => this.loading = false)).subscribe({
      next: () => {
        window.sessionStorage.removeItem('passwordResetEmail');
        window.sessionStorage.removeItem('passwordResetToken');
        Swal.fire({
          icon: 'success',
          title: 'Password reset successfully',
          text: 'You can now sign in with your new password.',
          confirmButtonText: 'Go to Login'
        }).then(() => this.router.navigate(['/login']));
      },
      error: (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: 'Unable to reset password',
          text: error.error?.message || 'Your reset session is invalid or expired. Start again.',
          confirmButtonText: 'Try again'
        });
      }
    });
  }

  private showValidation(text: string): void {
    Swal.fire({
      icon: 'warning',
      title: 'Check your password',
      text,
      confirmButtonText: 'OK'
    });
  }
}
