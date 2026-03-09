import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserProfileService } from '../../services/user-profile.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="container mx-auto p-4 pb-24 max-w-3xl">
      <h1 class="text-3xl font-bold mb-2">Registration</h1>
      <p class="text-slate-600 mb-6">Create your account once and save checkout details for fast ordering.</p>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" placeholder="John Doe">
              @if (registrationForm.get('name')?.hasError('required')) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email Address</mat-label>
              <input matInput formControlName="email" placeholder="john@example.com">
              @if (registrationForm.get('email')?.hasError('required')) {
                <mat-error>Email is required</mat-error>
              }
              @if (registrationForm.get('email')?.hasError('email')) {
                <mat-error>Enter a valid email address</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" placeholder="Create password">
              @if (registrationForm.get('password')?.hasError('required')) {
                <mat-error>Password is required</mat-error>
              }
              @if (registrationForm.get('password')?.hasError('minlength')) {
                <mat-error>Password must be at least 6 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Delivery Address</mat-label>
              <textarea matInput formControlName="address" rows="3" placeholder="123 Main St, City, Country"></textarea>
              @if (registrationForm.get('address')?.hasError('required')) {
                <mat-error>Address is required</mat-error>
              }
            </mat-form-field>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Card Number</mat-label>
                <input matInput formControlName="cardNumber" placeholder="1234 5678 9012 3456">
                @if (registrationForm.get('cardNumber')?.hasError('required')) {
                  <mat-error>Card number is required</mat-error>
                }
                @if (registrationForm.get('cardNumber')?.hasError('pattern')) {
                  <mat-error>Enter a valid 16-digit card number</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Card Holder Name</mat-label>
                <input matInput formControlName="cardHolder" placeholder="John Doe">
                @if (registrationForm.get('cardHolder')?.hasError('required')) {
                  <mat-error>Card holder name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Expiry (MM/YY)</mat-label>
                <input matInput formControlName="expiry" placeholder="08/28">
                @if (registrationForm.get('expiry')?.hasError('required')) {
                  <mat-error>Expiry is required</mat-error>
                }
                @if (registrationForm.get('expiry')?.hasError('pattern')) {
                  <mat-error>Use MM/YY format</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>CVV</mat-label>
                <input matInput formControlName="cvv" type="password" placeholder="123">
                @if (registrationForm.get('cvv')?.hasError('required')) {
                  <mat-error>CVV is required</mat-error>
                }
                @if (registrationForm.get('cvv')?.hasError('pattern')) {
                  <mat-error>CVV must be 3 digits</mat-error>
                }
              </mat-form-field>
            </div>

            @if (errorMessage) {
              <p class="text-sm text-rose-700">{{ errorMessage }}</p>
            }

            <div class="flex gap-3 justify-end mt-2">
              <a mat-stroked-button routerLink="/login">Already have an account? Login</a>
              <a mat-stroked-button routerLink="/menu">Skip for now</a>
              <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Creating account...' : 'Register & Continue' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class RegistrationComponent {
  private fb = inject(FormBuilder);
  private userProfileService = inject(UserProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  isSubmitting = false;
  errorMessage = '';

  registrationForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    address: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4}([ -]?\d{4}){3}$/)]],
    cardHolder: ['', Validators.required],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/(\d{2})$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  constructor() {
    const profile = this.userProfileService.getProfile();
    if (profile) {
      this.registrationForm.patchValue({
        ...profile,
        password: '',
      });
    }
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;
    const value = this.registrationForm.getRawValue();

    this.authService.register({
      name: value.name!,
      email: value.email!,
      password: value.password!,
      address: value.address!,
      cardNumber: value.cardNumber!,
      cardHolder: value.cardHolder!,
      expiry: value.expiry!,
      cvv: value.cvv!,
    }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || '/checkout');
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error?.error?.message || 'Registration failed. Please try again.';
        this.isSubmitting = false;
      },
    });
  }
}
