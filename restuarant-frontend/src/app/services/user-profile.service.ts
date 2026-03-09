import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private platformId = inject(PLATFORM_ID);
  private readonly profileStorageKey = 'urban-plate-user-profile';
  private profileSubject = new BehaviorSubject<UserProfile | null>(this.readProfileFromStorage());

  profile$ = this.profileSubject.asObservable();

  getProfile(): UserProfile | null {
    return this.profileSubject.value;
  }

  private readProfileFromStorage(): UserProfile | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const raw = localStorage.getItem(this.profileStorageKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as Partial<UserProfile>;
      if (!parsed.email || !parsed.name || !parsed.address) {
        return null;
      }

      return {
        name: parsed.name,
        email: parsed.email,
        address: parsed.address,
        cardNumber: parsed.cardNumber || '',
        cardHolder: parsed.cardHolder || '',
        expiry: parsed.expiry || '',
        cvv: parsed.cvv || '',
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  saveProfile(profile: Omit<UserProfile, 'updatedAt'>): UserProfile {
    const normalized: UserProfile = {
      ...profile,
      email: profile.email.trim().toLowerCase(),
      updatedAt: new Date().toISOString(),
    };

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.profileStorageKey, JSON.stringify(normalized));
    }

    this.profileSubject.next(normalized);

    return normalized;
  }

  hasProfile(): boolean {
    return this.getProfile() !== null;
  }

  clearProfile(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.profileStorageKey);
    }

    this.profileSubject.next(null);
  }
}
