import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  importProvidersFrom
} from '@angular/core';
import {provideRouter} from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import {routes} from './app.routes';
import { errorInterceptor } from './interceptors/error.interceptor';
import { mockBackendInterceptor } from './interceptors/mock-backend.interceptor';
import { USE_MOCK_BACKEND } from './config/runtime-config';

const httpInterceptors = USE_MOCK_BACKEND
  ? [mockBackendInterceptor, errorInterceptor]
  : [errorInterceptor];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBrowserGlobalErrorListeners(), 
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors(httpInterceptors)),
    provideAnimations(),
    importProvidersFrom(MatSnackBarModule)
  ],
};
