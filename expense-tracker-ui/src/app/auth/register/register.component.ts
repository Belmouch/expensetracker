import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../auth.service';
import { RegisterRequest } from '../../models/register-request';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  username = '';
  email = '';
 
  password = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {

    if (!this.username.trim() || !this.email.trim() || !this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing information',
        text: 'Please enter a username, email and password.',
        confirmButtonText: 'OK'
      });

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
}