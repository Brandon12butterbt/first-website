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
  selector: 'app-login',
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
          <mat-card-title class="text-2xl font-bold text-white mb-2">Welcome back</mat-card-title>
          <mat-card-subtitle class="text-gray-400">Sign in to your account</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content class="p-6">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <mat-form-field appearance="fill" class="w-full">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email" required>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Invalid email format</mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="fill" class="w-full">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" placeholder="Enter your password" required>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
            </mat-form-field>
            
            <div class="flex justify-end">
              <a routerLink="/reset-password" class="text-purple-400 hover:text-purple-300 text-sm">
                Forgot password?
              </a>
            </div>
            
            <div class="pt-2">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                class="w-full bg-purple-600 hover:bg-purple-700"
                [disabled]="isLoading || !loginForm.valid">
                <span *ngIf="isLoading" class="text-white font-medium">Signing in...</span>
                <span *ngIf="!isLoading" class="text-white font-medium">Sign in</span>
              </button>
            </div>
            
            <div *ngIf="errorMessage" class="text-red-500 mt-2 text-center">
              {{ errorMessage }}
            </div>
          </form>
        </mat-card-content>
        
        <mat-card-actions class="p-6 pt-0">
          <div class="text-center text-gray-400">
            Don't have an account? 
            <a routerLink="/signup" class="text-purple-400 hover:text-purple-300">Sign up</a>
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
export class LoginComponent {
  loginForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  hidePassword: boolean = true;
  
  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }
  
  async onSubmit() {
    if (this.loginForm.invalid) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const { email, password } = this.loginForm.value;
    
    try {
      const { user, error } = await this.supabaseService.signIn(email, password);
      
      if (error) {
        this.errorMessage = error.message;
      } else {
        // Successfully signed in
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'An unexpected error occurred';
    } finally {
      this.isLoading = false;
    }
  }
} 