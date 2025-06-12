import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

interface Profile {
  id: string;
  email: string;
  credits: number;
  images_generated: number;
  created_at: string;
}

@Component({
  selector: 'app-delete-account-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  template: `
    <div class="bg-gray-850 p-6 rounded-xl max-w-md w-full">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-white">Delete Account</h2>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon class="text-gray-400">close</mat-icon>
        </button>
      </div>
      
      <div class="mb-6">
        <p class="text-gray-300 mb-4">This action cannot be undone. All your data, including generated images and credits, will be permanently deleted.</p>
        <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
          <div class="flex items-start">
            <mat-icon class="text-red-400 mr-3">warning</mat-icon>
            <p class="text-red-200 text-sm">For security, please enter your email address to confirm deletion.</p>
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label class="text-white">Enter your email</mat-label>
          <input matInput [(ngModel)]="confirmEmail" placeholder="your@email.com" (keyup.enter)="confirmEmail.trim() === data.email.trim() && onConfirm()">
          <mat-icon matSuffix *ngIf="confirmEmail.trim() === data.email.trim()" class="text-green-500">check_circle</mat-icon>
        </mat-form-field>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button mat-button (click)="onCancel()" class="text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors duration-200">
          Cancel
        </button>
        <button mat-raised-button [disabled]="(confirmEmail | lowercase) !== (data.email | lowercase)" (click)="onConfirm()" 
          class="text-white bg-red-600 hover:bg-red-700 disabled:bg-red-900/30 disabled:text-gray-400 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors duration-200">
          Confirm Deletion
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      /* Remove the notch */
      background-color: transparent !important;
    }

    ::ng-deep .mdc-notched-outline__notch {
      /* Hide the middle line */
      border-right: none !important;
    }
    
    ::ng-deep .mdc-text-field--outlined {
      --mdc-outlined-text-field-container-color: rgba(17, 24, 39, 0.8);
      --mdc-outlined-text-field-outline-color: rgba(139, 92, 246, 0.3);
      --mdc-outlined-text-field-label-text-color: rgba(209, 213, 219, 0.8);
      --mdc-outlined-text-field-input-text-color: white;
      --mdc-outlined-text-field-focus-outline-color: rgba(139, 92, 246, 0.6);
      --mdc-outlined-text-field-hover-outline-color: rgba(139, 92, 246, 0.4);
    }
  `]
})
export class DeleteAccountDialogComponent {
  confirmEmail: string = '';
  
  constructor(
    public dialogRef: MatDialogRef<DeleteAccountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string }
  ) {}
  
  onCancel(): void {
    this.dialogRef.close(false);
  }
  
  onConfirm(): void {
    if (this.confirmEmail.trim() === this.data.email.trim()) {
      this.dialogRef.close(true);
    }
  }
}

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatDialogModule
  ],
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AccountDetailsComponent implements OnInit {
  profile: any = null;
  isLoading = true;
  session: any = null;

  constructor(
    private supabaseAuthService: SupabaseAuthService, 
    private router: Router,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.isLoading = true;

    const loadingTimeout = setTimeout(() => {
      if (this.isLoading) {
        console.warn('Timeout reached: forcing isLoading = false');
        this.isLoading = false;
      }
    }, 8000);

    const session = await this.supabaseAuthService.getSession();
    this.session = session;

    if (session) {
      await this.getFluxProfile(session);
    } else {
      this.profile = null;
    }

    clearTimeout(loadingTimeout);
    this.isLoading = false;
  }

  async getFluxProfile(session: any) {
    try {
      const { user } = session;
      const { data: profile, error } = await this.supabaseAuthService.fluxProfile(user.id);
      if (error) {
        throw error;
      }
      if (profile) {
        this.profile = null;
        this.profile = profile;
      }
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Calculate a percentage for the progress bar based on images generated
   * This is for visual purposes in the UI
   */
  getImageGenerationPercentage(): number {
    if (!this.profile) return 0;
    
    // For UI purposes, we'll set some thresholds
    // The more images generated, the higher the percentage (capped at 100%)
    const images = this.profile.images_generated;
    
    if (images <= 10) {
      return Math.max(10, images * 5); // At least 10% filled
    } else if (images <= 50) {
      return 50 + (images - 10) / 40 * 25; // 50-75% range
    } else {
      return Math.min(100, 75 + (images - 50) / 50 * 25); // 75-100% range
    }
  }
  
  /**
   * Calculate a creativity score based on user activity
   * This is a gamification element to encourage more usage
   */
  getCreativityScore(): string {
    if (!this.profile) return '0';
    
    // Calculate based on usage metrics
    const baseScore = this.profile.images_generated * 5;
    const creditBonus = this.profile.credits > 0 ? Math.min(50, this.profile.credits) : 0;
    
    // Calculate days since sign-up for tenure bonus
    const signupDate = new Date(this.profile.created_at);
    const today = new Date();
    const daysSinceSignup = Math.floor((today.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));
    const tenureBonus = Math.min(100, daysSinceSignup);
    
    // Total score with some balance
    const totalScore = Math.min(1000, baseScore + creditBonus + tenureBonus);
    
    // Format with separator
    return totalScore.toLocaleString();
  }

  async deleteEntireProfile() {
    const dialogRef = this.dialog.open(DeleteAccountDialogComponent, {
      width: '450px',
      panelClass: 'custom-dialog-container',
      backdropClass: 'dialog-backdrop',
      data: { email: this.profile.email }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed) {
        this.isLoading = true;
        try {
          await this.supabaseAuthService.deleteFluxProfile(this.profile.id);
          await this.supabaseAuthService.deleteGeneratedImages(this.profile.id);
          await this.supabaseAuthService.deleteTokenPurchases(this.profile.id);
          await this.supabaseAuthService.deleteTokenTracker(this.profile.id);

          const result = await firstValueFrom(this.supabaseAuthService.deleteEntireProfile(this.profile.id));

          if (result.error) {
            throw result.error;
          } else {
            this.profile = null;
          }
        } catch (error) {
          if (error instanceof Error) {
            console.log(error);
          }
        } finally {
          this.isLoading = false;
          await this.supabaseAuthService.signOut();
          // Used to trigger nav bar profile credits update
          this.supabaseAuthService.triggerAuthChange('SIGNED_OUT', this.session);
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/']);
          });
        }
      }
    });
  }
}
