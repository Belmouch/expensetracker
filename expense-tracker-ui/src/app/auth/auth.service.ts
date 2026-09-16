import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { LoginRequest } from '../models/login-request';
import { ChangePasswordRequest } from '../models/change-password-request';
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
    ).pipe(timeout(15000));
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {

    return this.http.put<void>(
      `${this.apiUrl}/change-password`,
      request
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