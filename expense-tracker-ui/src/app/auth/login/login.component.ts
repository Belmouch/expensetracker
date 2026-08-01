import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { LoginRequest } from '../../models/login-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {

    const request: LoginRequest = {
      username: this.username,
      password: this.password
    };

    this.authService.login(request).subscribe({

      next: (token) => {

        localStorage.setItem('token', token);

        alert('Login successful');

        this.router.navigate(['/expenses']);
      },

      error: () => {

        alert('Username or password incorrect');

      }

    });

  }

}