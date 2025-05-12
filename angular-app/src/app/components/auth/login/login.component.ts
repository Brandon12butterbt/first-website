import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SupabaseAuthService } from '../../../services/supabase-auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  hidePassword: boolean = true;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private supabaseAuthService: SupabaseAuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }
  
  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const { error } = await this.supabaseAuthService.signIn(this.loginForm.get('email')?.value, this.loginForm.get('password')?.value);

        if (error) {
          throw error;
        } else {
          this.router.navigate(['/']);
        }
        
      } catch (err: any) {
        this.errorMessage = err.message || 'An error occurred during login';
      } finally {
        this.isLoading = false;
      }
    }
  }
} 