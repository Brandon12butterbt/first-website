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

import { SupabaseAuthService } from '../../../services/supabase-auth.service';

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
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
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
    private router: Router,
    private supabaseAuthService: SupabaseAuthService
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
        // const { success, error } = await this.supabaseService.signUp(
        //   this.signupForm.get('email')?.value,
        //   this.signupForm.get('password')?.value
        // );
        const success = await this.supabaseAuthService.signUp(
          this.signupForm.get('email')?.value, this.signupForm.get('password')?.value
        );
        
        if (success) {
          this.router.navigate(['/post-signup']);
        }
        // else {
        //   this.errorMessage = error || 'An error occurred during signup';
        // }
      } catch (err: any) {
        this.errorMessage = err.message || 'An error occurred during signup';
      } finally {
        this.isLoading = false;
      }
    }
  }
}