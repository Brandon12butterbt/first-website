import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

import { SupabaseAuthService } from '../../../services/supabase-auth.service';

@Component({
  selector: 'app-update-password',
  standalone: false,
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.css'
})
export class UpdatePasswordComponent {
  updateForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  passwordUpdated: boolean = false;

  constructor(
    private fb: FormBuilder,
    private supabaseAuthService: SupabaseAuthService,
    private router: Router
  ) {
    this.updateForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8),Validators.maxLength(30)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8),Validators.maxLength(30)]]
    }, { validator: this.passwordMatchValidator });

    this.updateForm.valueChanges.subscribe(() => {
      if (this.updateForm.get('confirmPassword')?.dirty) {
        this.updateForm.updateValueAndValidity();
      }
    });
  }

  async onSubmit() {
    if (this.updateForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const success = await this.supabaseAuthService.updatePassword(this.updateForm.get('newPassword')?.value);
        
        if (success) {
          this.successMessage = 'Password has been updated successfully';
          this.errorMessage = '';
          this.passwordUpdated = true;
        }
      } catch (err: any) {
        this.errorMessage = err.message || 'An error occurred while updating your password';
      } finally {
        this.isLoading = false;
      }
    }
  }

  passwordMatchValidator(control: AbstractControl) {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (control.get('confirmPassword')?.hasError('passwordMismatch')) {
        control.get('confirmPassword')?.setErrors(null);
        control.get('confirmPassword')?.updateValueAndValidity();
      }
      return null;
    }
  }
}
