import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StripeService } from '../../services/stripe.service';
import { SupabaseService } from '../../services/supabase.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { v4 as uuidv4 } from 'uuid';
import { CreditPackage } from '../shared/credit-packages';
import { ConfigService } from '../../services/config.service';

import { SupabaseAuthService } from '../../services/supabase-auth.service';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.css']
})
export class UpgradeComponent implements OnInit {
  profile: any = null;
  userEmail: string = '';
  isLoading: boolean = true;
  isPurchasing: boolean = false;
  creditPackages: CreditPackage[] = [];
  
  constructor(
    private stripeService: StripeService,
    private supabaseService: SupabaseService,
    private router: Router,
    private paymentService: PaymentService,
    public config: ConfigService,
    private supabaseAuthService: SupabaseAuthService
  ) {}
  
  ngOnInit() {
    this.creditPackages = this.stripeService.creditPackages;
    // this.loadUserProfile().then(() => {
    //   this.isLoading = false;
    // });
    if (this.supabaseAuthService.session) {
      this.getFluxProfile(this.supabaseAuthService.session).then(() => {
        this.isLoading = false;
      });
    }
  }
  
  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }
  
  async loadUserProfile() {
    const user = this.supabaseService.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.userEmail = user.email || '';
    this.profile = await this.supabaseService.getProfile();
  }
  
  async purchaseCredits(packageId: string) {
    const uuid: string = uuidv4();
    // await this.supabaseService.saveTokenTracker(uuid, packageId);
    const result = await this.supabaseAuthService.saveTokenTracker(this.profile.id, packageId, uuid);
    console.log("Result of saving token: ", result);
    setTimeout(() => { }, 5000);
    sessionStorage.setItem('token', uuid);
    console.log('sesssion stroage: ', uuid);
    this.paymentService.setApiCallMade(true);
    if (packageId === 'basic') {
      window.location.href = this.config.stripeBasicUrl;
    } else if (packageId === 'standard') {
      window.location.href = this.config.stripeStandardUrl;
    } else if (packageId === 'premium') {
      window.location.href = this.config.stripePremiumUrl;
    }
  }

  async getFluxProfile(session: any) {
    try {
      const { user } = session;
      const { data: profile, error, status } = await this.supabaseAuthService.fluxProfile(user.id);
      if (error && status !== 406) {
        throw error;
      }
      if (profile) {
        this.profile = profile;
        console.log('Profile from app comp: ', this.profile);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      console.log('fin');
      this.isLoading = false;
    }
  }
} 