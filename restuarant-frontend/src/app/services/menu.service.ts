import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MenuItem } from '../models/menu-item.model';
import { isPlatformBrowser } from '@angular/common';
import { buildApiUrl } from '../config/runtime-config';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = buildApiUrl('/api/menu');

  getMenuItems(): Observable<MenuItem[]> {
    if (isPlatformBrowser(this.platformId)) {
      return this.http.get<MenuItem[]>(this.apiUrl);
    }
    return of([]); // Return empty array on server to prevent build errors with relative URLs
  }

  getMenuItem(id: number): Observable<MenuItem> {
    if (isPlatformBrowser(this.platformId)) {
      return this.http.get<MenuItem>(`${this.apiUrl}/${id}`);
    }
    return of({} as MenuItem);
  }
}
