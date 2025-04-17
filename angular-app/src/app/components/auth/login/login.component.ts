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
    private supabaseService: SupabaseService,
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
        // const { success, error } = await this.supabaseService.signIn(
        //   this.loginForm.get('email')?.value,
        //   this.loginForm.get('password')?.value
        // );
        const { error } = await this.supabaseAuthService.signIn(this.loginForm.get('email')?.value, this.loginForm.get('password')?.value);

        if (error) {
          throw error;
        } else {
          this.router.navigate(['/']);
        }
        
        // if (success) {
        //   this.router.navigate(['/'], { onSameUrlNavigation: 'reload' });
        // } else {
        //   this.errorMessage = error || 'An error occurred during login';
        // }
      } catch (err: any) {
        this.errorMessage = err.message || 'An error occurred during login';
      } finally {
        this.isLoading = false;
      }
    }
  }
} 