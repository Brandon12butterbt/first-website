import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StripeService } from '../../services/stripe.service';

import { getCreditPackageById } from '../shared/credit-packages';
import { SupabaseAuthService } from '../../services/supabase-auth.service';

@Component({
  selector: 'app-payment-success',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent {
  profile: any = null;
  userEmail: string = '';
  isLoading: boolean = true;
  token: any = null;
  newCredits: number = 0;

  constructor(
    private router: Router,
    private stripeService: StripeService,
    private supabaseAuthService: SupabaseAuthService
  ) {}

  async ngOnInit() {
    const session = await this.supabaseAuthService.ensureSessionLoaded();
    if (session) {
      this.checkTokens(session).then(() => {
        if (this.profile) {
          this.userEmail = this.profile.email;
        }
      });
    }
    // this.handleTokenTracker().then(() => {
    //   this.isLoading = false;
    // });
  }

  async checkTokens(session: any) {
    try {
      const { user } = session;
      const { data: profile, error, status } = await this.supabaseAuthService.fluxProfile(user.id);
      if (error && status !== 406) {
        throw error;
      }
      if (profile) {
        this.profile = profile;

        this.token = await this.supabaseAuthService.getTokenTracker(this.profile.id);
        if (!this.token) {
          this.router.navigate(['/']);
          return;
        }
    
        const sessionToken = sessionStorage.getItem('token');
    
        if (sessionToken) {
          console.log('This token:', this.token);
          if (sessionToken !== this.token.data.unique_id) {
            // Session token does not match database token, redirect to home page
            sessionStorage.setItem('token', '');
            await this.supabaseAuthService.deleteTokenTracker(this.profile.id);
            this.router.navigate(['/']);
          }
          
          // Session token matches database token, proceed with payment success
          this.newCredits = await this.stripeService.handlePaymentSuccess(this.profile, this.token.data.package_type);
          sessionStorage.setItem('token', '');
          await this.supabaseAuthService.deleteTokenTracker(this.profile.id);
    
          this.userEmail = this.profile.email || '';

          const creditPackage = getCreditPackageById(this.token.data.package_type);
          await this.supabaseAuthService.savePurchase(this.profile.id, this.token, creditPackage);
        } else {
          // Session token not found, redirect to home page
          await this.supabaseAuthService.deleteTokenTracker(this.profile.id);
          this.router.navigate(['/']);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
      }
    } finally {
      // Used to trigger nav bar profile credits update
      this.supabaseAuthService.triggerAuthChange('SIGNED_IN', session);
      this.isLoading = false;
    }
  }

  // async handleTokenTracker() {
  //   const user = this.checkUser();

  //   this.token = this.supabaseService.getTokenTracker();

  //   if (!this.token) {
  //     this.router.navigate(['/']);
  //     return;
  //   }

  //   const sessionToken = sessionStorage.getItem('token');

  //   if (sessionToken) {
  //     if (sessionToken !== this.token.unique_id) {
  //       // Session token does not match database token, redirect to home page
  //       sessionStorage.setItem('token', '');
  //       await this.supabaseService.deleteTokenTracker();
  //       this.router.navigate(['/']);
  //     }
      
  //     // Session token matches database token, proceed with payment success
  //     await this.stripeService.handlePaymentSuccess(this.token.package_type);
  //     sessionStorage.setItem('token', '');
  //     await this.supabaseService.deleteTokenTracker();

  //     this.userEmail = user.email || '';
  //     this.profile = await this.supabaseService.getProfile();

  //     await this.supabaseService.savePurchase(this.token);
  //   } else {
  //     // Session token not found, redirect to home page
  //     await this.supabaseService.deleteTokenTracker();
  //     this.router.navigate(['/']);
  //   }

  // }
}
