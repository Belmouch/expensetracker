import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

import { AuthService } from '../auth.service';
import { ChangePasswordRequest } from '../../models/change-password-request';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  loading = false;

  constructor(private authService: AuthService) {}

  changePassword(): void {
    if (this.loading || !this.isValid()) {
      return;
    }

    const request: ChangePasswordRequest = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    };

    this.loading = true;

    this.authService.changePassword(request).subscribe({
      next: () => {
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';

        Swal.fire({
          icon: 'success',
          title: 'Password updated',
          text: 'Your password has been changed successfully.',
          confirmButtonText: 'OK'
        });
      },
      error: (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: 'Unable to change password',
          text: this.getErrorMessage(error),
          confirmButtonText: 'Try again'
        });
      }
    }).add(() => this.loading = false);
  }

  private isValid(): boolean {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.showValidationMessage('Please complete all password fields.');
      return false;
    }

    if (this.newPassword.length < 8) {
      this.showValidationMessage('Your new password must contain at least 8 characters.');
      return false;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showValidationMessage('New password and confirmation do not match.');
      return false;
    }

    return true;
  }

  private showValidationMessage(text: string): void {
    Swal.fire({
      icon: 'warning',
      title: 'Check your password',
      text,
      confirmButtonText: 'OK'
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 400) {
      return error.error?.detail || error.error?.message || 'The current password is incorrect or the new passwords do not match.';
    }

    if (error.status === 0) {
      return 'Unable to connect to the server. Please try again.';
    }

    return 'Unable to change your password. Please try again later.';
  }
}
