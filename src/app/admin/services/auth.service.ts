import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  token: string;
}

interface AdminProfile {
  _id: string;
  username: string;
  email: string;
  lastLogin: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private readonly TOKEN_KEY = 'admin_token';
  private apiUrl = `${environment.apiUrl}/api/admin`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getAdminProfile(): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${this.apiUrl}/me`);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
} 