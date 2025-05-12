import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SupabaseAuthService } from '../../../services/supabase-auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private supabaseAuthService: SupabaseAuthService
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

        const success = await this.supabaseAuthService.resetPassword(this.resetForm.get('email')?.value);
        
        if (success) {
          this.successMessage = 'Password reset instructions have been sent to your email';
          this.errorMessage = '';
        }
      } catch (err: any) {
        this.errorMessage = err.message || 'An error occurred while resetting your password';
      } finally {
        this.isLoading = false;
      }
    }
  }
} 