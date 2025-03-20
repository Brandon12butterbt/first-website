import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-900">
      <mat-card class="max-w-md w-full bg-gray-800 rounded-lg shadow-xl">
        <mat-card-header class="text-center">
          <mat-card-title class="text-2xl font-bold text-white mb-2">Create your account</mat-card-title>
          <mat-card-subtitle class="text-gray-400">Start generating AI images today</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content class="p-6">
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <mat-form-field appearance="fill" class="w-full">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email" required>
              <mat-error *ngIf="signupForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="signupForm.get('email')?.hasError('email')">Invalid email format</mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="fill" class="w-full">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" placeholder="Create a password" required>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="signupForm.get('password')?.hasError('required')">Password is required</mat-error>
              <mat-error *ngIf="signupForm.get('password')?.hasError('minlength')">Password must be at least 6 characters</mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="fill" class="w-full">
              <mat-label>Confirm Password</mat-label>
              <input matInput formControlName="confirmPassword" [type]="hideConfirmPassword ? 'password' : 'text'" placeholder="Confirm your password" required>
              <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
                <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="signupForm.get('confirmPassword')?.hasError('required')">Please confirm your password</mat-error>
              <mat-error *ngIf="signupForm.get('confirmPassword')?.hasError('passwordMismatch')">Passwords do not match</mat-error>
            </mat-form-field>
            
            <div class="pt-2">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                class="w-full bg-purple-600 hover:bg-purple-700"
                [disabled]="isLoading || !signupForm.valid">
                <span *ngIf="isLoading" class="text-white font-medium">Creating account...</span>
                <span *ngIf="!isLoading" class="text-white font-medium">Sign up</span>
              </button>
            </div>
            
            <div *ngIf="errorMessage" class="text-red-500 mt-2 text-center">
              {{ errorMessage }}
            </div>
          </form>
        </mat-card-content>
        
        <mat-card-actions class="p-6 pt-0">
          <div class="text-center text-gray-400">
            Already have an account? 
            <a routerLink="/login" class="text-purple-400 hover:text-purple-300">Sign in</a>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-form-field {
      width: 100%;
    }
    
    ::ng-deep .mat-form-field-flex {
      background-color: rgba(30, 34, 45, 0.6) !important;
    }
    
    ::ng-deep .mat-form-field-underline {
      background-color: rgba(255, 255, 255, 0.2) !important;
    }
    
    ::ng-deep .mat-form-field.mat-focused .mat-form-field-ripple {
      background-color: #9e66e4 !important;
    }
    
    ::ng-deep .mat-form-field-label, 
    ::ng-deep .mat-form-field-required-marker {
      color: rgba(255, 255, 255, 0.7) !important;
    }
    
    ::ng-deep .mat-input-element {
      color: white !important;
    }
    
    ::ng-deep .mat-form-field-invalid .mat-form-field-ripple {
      background-color: #f44336 !important;
    }
  `]
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  successMessage: string = '';
  
  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }
  
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    }
  }
  
  async onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const { success, error } = await this.supabaseService.signUp(
          this.signupForm.get('email')?.value,
          this.signupForm.get('password')?.value
        );
        
        if (success) {
          this.successMessage = 'Account created successfully! Please check your email to verify your account.';
          this.errorMessage = '';
        } else {
          this.errorMessage = error || 'An error occurred during signup';
        }
      } catch (err: any) {
        this.errorMessage = err.message || 'An error occurred during signup';
      } finally {
        this.isLoading = false;
      }
    }
  }
} 