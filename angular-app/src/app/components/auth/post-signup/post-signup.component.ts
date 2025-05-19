import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthDataService } from '../../../services/auth-data.service';
import { SupabaseAuthService } from '../../../services/supabase-auth.service';

@Component({
  selector: 'app-post-signup',
  standalone: false,
  templateUrl: './post-signup.component.html',
  styleUrls: ['./post-signup.component.css']
})
export class PostSignupComponent implements OnInit {
  isResending = false;
  userEmail: string = '';
  
  constructor(
    private snackBar: MatSnackBar,
    private authDataService: AuthDataService,
    private supabaseAuthService: SupabaseAuthService
  ) {}
  
  ngOnInit(): void {
    this.userEmail = this.authDataService.getSignupEmail();
  }
  
  resendVerificationEmail(): void {
    if (!this.userEmail) {
      this.showNotification('No email address found. Please try signing up again.', 'error-snackbar');
      return;
    }
    
    this.isResending = true;
    
    this.supabaseAuthService.resendSignUp(this.userEmail)
      .then(response => {
        this.isResending = false;
        if (response.error) {
          this.showNotification(response.error.message || 'Failed to resend verification email', 'error-snackbar');
        } else {
          this.showNotification('Verification email resent successfully!');
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