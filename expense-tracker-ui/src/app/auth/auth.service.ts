import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<string> {
    return this.http.post(this.apiUrl + '/login', request, {
      responseType: 'text'
    });
  }
  register(request: RegisterRequest): Observable<void> {
  return this.http.post<void>(
    'http://localhost:8080/auth/register',
    request
  );
}
}