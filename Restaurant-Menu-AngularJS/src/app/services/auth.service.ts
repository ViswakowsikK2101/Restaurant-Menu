import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserProfileService } from './user-profile.service';

interface AuthApiUser {
  name: string;
  email: string;
  address: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

interface AuthApiResponse {
  message?: string;
  user: AuthApiUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  address: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private userProfileService = inject(UserProfileService);
  private apiUrl = '/api/auth';

  register(payload: RegisterPayload): Observable<void> {
    return this.http.post<AuthApiResponse>(`${this.apiUrl}/register`, payload).pipe(
      map((res) => res.user),
      tap((user) => {
        this.userProfileService.saveProfile({
          name: user.name,
          email: user.email,
          address: user.address,
          cardNumber: user.cardNumber,
          cardHolder: user.cardHolder,
          expiry: user.expiry,
          cvv: user.cvv,
        });
      }),
      map(() => void 0)
    );
  }

  login(payload: LoginPayload): Observable<void> {
    return this.http.post<AuthApiResponse>(`${this.apiUrl}/login`, payload).pipe(
      map((res) => res.user),
      tap((user) => {
        this.userProfileService.saveProfile({
          name: user.name,
          email: user.email,
          address: user.address,
          cardNumber: user.cardNumber,
          cardHolder: user.cardHolder,
          expiry: user.expiry,
          cvv: user.cvv,
        });
      }),
      map(() => void 0)
    );
  }

  logout(): void {
    this.userProfileService.clearProfile();
  }
}
