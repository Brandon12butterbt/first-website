import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SupabaseAuthService } from '../../../services/supabase-auth.service';
import { AuthDataService } from '../../../services/auth-data.service';

@Component({
  selector: 'app-signup',
  standalone: false,
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
    private router: Router,
    private supabaseAuthService: SupabaseAuthService,
    private authDataService: AuthDataService
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
        const email = this.signupForm.get('email')?.value;
        const password = this.signupForm.get('password')?.value;
        
        const success = await this.supabaseAuthService.signUp(email, password);
        
        if (success) {
          // Store the email for the post-signup component
          this.authDataService.setSignupEmail(email);
          this.router.navigate(['/auth/post-signup']);
        }
      } catch (err: any) {
        this.errorMessage = err.message || 'An error occurred during signup';
      } finally {
        this.isLoading = false;
      }
    }
  }
}