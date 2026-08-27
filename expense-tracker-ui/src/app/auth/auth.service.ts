import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  // =========================
  // LOGIN
  // =========================

  login(request: LoginRequest): Observable<string> {

    return this.http.post(
      `${this.apiUrl}/login`,
      request,
      {
        responseType: 'text'
      }
    );
  }

  // =========================
  // REGISTER
  // =========================

  register(request: RegisterRequest): Observable<void> {

    return this.http.post<void>(
      `${this.apiUrl}/register`,
      request
    );
  }
}