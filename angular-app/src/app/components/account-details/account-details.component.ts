import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
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
  selector: 'app-account-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule
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

  constructor(private supabaseAuthService: SupabaseAuthService, private router: Router) {}

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
      if (error instanceof Error) {
        console.log(error);
      }
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
}
