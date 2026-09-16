import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './verify-code.component.html',
  styleUrl: '../password-reset.css'
})
export class VerifyCodeComponent implements OnInit {

  email = '';
  code = '';
  loading = false;
  resending = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.email = typeof window !== 'undefined'
      ? window.sessionStorage.getItem('passwordResetEmail') || ''
      : '';
    if (!this.email) {
      this.router.navigate(['/forgot-password']);
    }
  }

  submit(): void {
    if (this.loading) {
      return;
    }

    if (!/^\d{6}$/.test(this.code)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid code',
        text: 'Enter the 6-digit verification code from your email.',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.loading = true;
    this.authService.verifyResetCode({ email: this.email, code: this.code })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('passwordResetToken', response.resetToken);
          this.router.navigate(['/reset-password']);
        },
        error: (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: 'Code not accepted',
            text: error.error?.message || 'The code is invalid or expired. Request a new code and try again.',
            confirmButtonText: 'Try again'
          });
        }
      });
  }

  resendCode(): void {
    if (this.resending || !this.email) {
      return;
    }

    this.resending = true;
    this.authService.forgotPassword({ email: this.email })
      .pipe(finalize(() => this.resending = false))
      .subscribe({
        next: () => Swal.fire({
          icon: 'success',
          title: 'Code requested',
          text: 'If the email exists, a new verification code has been sent.',
          confirmButtonText: 'OK'
        }),
        error: () => Swal.fire({
          icon: 'error',
          title: 'Unable to resend code',
          text: 'Please try again shortly.',
          confirmButtonText: 'OK'
        })
      });
  }
}
