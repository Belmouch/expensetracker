import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {

    if (!this.username || !this.password) {
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

      error: () => {

        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: 'Username or password is incorrect.',
          confirmButtonText: 'Try again'
        });

      }

    });
  }
}