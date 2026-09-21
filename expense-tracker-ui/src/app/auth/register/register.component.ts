import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../auth.service';
import { RegisterRequest } from '../../models/register-request';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  username = '';
  email = '';
 
  password = '';
  showPassword = false;
  confirmPassword = '';
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {

    if (
      !this.username.trim() ||
      !this.email.trim() ||
      !this.password
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing information',
        text: 'Please enter a username, email and password.',
        confirmButtonText: 'OK'
      });

      return;
    }

    if (!this.isPasswordValid() || !this.passwordsMatch()) {
      return;
    }

    const request: RegisterRequest = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.authService.register(request).subscribe({

      next: () => {

        Swal.fire({
          icon: 'success',
          title: 'Account created!',
          text: 'Your account has been created successfully.',
          confirmButtonText: 'Go to Login'
        }).then(() => {

          this.router.navigate(['/login']);

        });

      },

      error: (err) => {

        console.error(err);

        Swal.fire({
          icon: 'error',
          title: 'Registration failed',
          text: 'Unable to create your account.',
          confirmButtonText: 'Try again'
        });

      }

    });
  }

  getPasswordValidationMessages(): string[] {
    const messages: string[] = [];

    if (this.password.length < 8) {
      messages.push('Password must be at least 8 characters.');
    }

    if (!/[A-Z]/.test(this.password)) {
      messages.push('Password must contain at least one uppercase letter.');
    }

    if (!/[a-z]/.test(this.password)) {
      messages.push('Password must contain at least one lowercase letter.');
    }

    if (!/[0-9]/.test(this.password)) {
      messages.push('Password must contain at least one number.');
    }

    if (!/[^A-Za-z0-9]/.test(this.password)) {
      messages.push('Password must contain at least one special character.');
    }

    return messages;
  }

  isPasswordValid(): boolean {
    return this.getPasswordValidationMessages().length === 0;
  }

  passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }
}