import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseAuthService } from '../../../services/supabase-auth.service';
import { AuthDataService } from '../../../services/auth-data.service';

@Component({
  selector: 'app-expired-signup',
  standalone: false,
  templateUrl: './expired-signup.component.html',
  styleUrls: ['./expired-signup.component.css']
})
export class ExpiredSignupComponent implements OnInit {
  isResending = false;
  errorMessage: string = '';
  expiredForm: FormGroup;
  
  constructor(
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authDataService: AuthDataService,
    private supabaseAuthService: SupabaseAuthService
  ) {
    this.expiredForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        const errorCode = params.get('error_code');
        
        if (errorCode === 'otp_expired' || errorCode?.includes('expired')) {
          this.errorMessage = 'Your verification link has expired.';
        } else {
          this.errorMessage = params.get('error_description') || 'Your verification link is invalid or has expired.';
          this.errorMessage = this.errorMessage.replace(/\+/g, ' ');
        }

        const email = params.get('email');
        if (email) {
          this.expiredForm.get('email')?.setValue(email);
        }
      }
    });
  }
  
  async onSubmit() {
    console.log('onSubmit');
    if (this.expiredForm.invalid) {
      this.expiredForm.markAllAsTouched();
      return;
    }
    
    const email = this.expiredForm.get('email')?.value;
    this.isResending = true;
    
    this.supabaseAuthService.resendSignUp(email)
      .then(response => {
        this.isResending = false;
        if (response.error) {
          this.showNotification(response.error.message || 'Failed to resend verification email', 'error-snackbar');
        } else {
          this.showNotification('Verification email resent successfully!');
          this.authDataService.setSignupEmail(email);
        }
      })
      .catch(error => {
        this.isResending = false;
        this.showNotification('Failed to resend email: ' + (error.message || 'Unknown error'), 'error-snackbar');
      });
  }
  
  private showNotification(message: string, panelClass: string = 'success-snackbar'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [panelClass]
    });
  }
} 