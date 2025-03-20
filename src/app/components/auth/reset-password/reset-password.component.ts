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
  selector: 'app-reset-password',
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
          <mat-card-title class="text-2xl font-bold text-white mb-2">Reset Password</mat-card-title>
          <mat-card-subtitle class="text-gray-400">Enter your email to receive a password reset link</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content class="p-6">
          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <mat-form-field appearance="fill" class="w-full">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email" required>
              <mat-error *ngIf="resetForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="resetForm.get('email')?.hasError('email')">Invalid email format</mat-error>
            </mat-form-field>
            
            <div class="pt-2">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                class="w-full bg-purple-600 hover:bg-purple-700"
                [disabled]="isLoading || !resetForm.valid">
                <span *ngIf="isLoading" class="text-white font-medium">Sending link...</span>
                <span *ngIf="!isLoading" class="text-white font-medium">Send reset link</span>
              </button>
            </div>
            
            <div *ngIf="errorMessage" class="text-red-500 mt-2 text-center">
              {{ errorMessage }}
            </div>
            
            <div *ngIf="successMessage" class="text-green-500 mt-2 text-center">
              {{ successMessage }}
            </div>
          </form>
        </mat-card-content>
        
        <mat-card-actions class="p-6 pt-0">
          <div class="text-center text-gray-400">
            Remember your password? 
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
export class ResetPasswordComponent {
  resetForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  async onSubmit() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const { success, error } = await this.supabaseService.resetPassword(
          this.resetForm.get('email')?.value
        );
        
        if (success) {
          this.successMessage = 'Password reset instructions have been sent to your email';
          this.errorMessage = '';
        } else {
          this.errorMessage = error || 'An error occurred while resetting your password';
        }
      } catch (err: any) {
        this.errorMessage = err.message || 'An error occurred while resetting your password';
      } finally {
        this.isLoading = false;
      }
    }
  }
} 