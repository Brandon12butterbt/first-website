import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StripeService } from '../../services/stripe.service';
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
import { NavigationService } from '../../services/navigation.service';

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
  isPurchasing: boolean = false;
  creditPackages: CreditPackage[] = [];
  
  constructor(
    private stripeService: StripeService,
    private router: Router,
    private paymentService: PaymentService,
    public config: ConfigService,
    private supabaseAuthService: SupabaseAuthService,
    private navigationService: NavigationService
  ) {}
  
  async ngOnInit() {
    this.creditPackages = this.stripeService.creditPackages;
    const session = await this.supabaseAuthService.ensureSessionLoaded();
    if (session) {
      await this.getFluxProfile(session);
    }

    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }
  
  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }
  
  
  async purchaseCredits(packageId: string) {
    const uuid: string = uuidv4();
    await this.supabaseAuthService.saveTokenTracker(this.profile.id, packageId, uuid);
    sessionStorage.setItem('token', uuid);
    this.paymentService.setApiCallMade(true);

    if (packageId === 'basic') {
      this.navigationService.navigateTo(this.config.stripeBasicUrl);
    } else if (packageId === 'standard') {
      this.navigationService.navigateTo(this.config.stripeStandardUrl);
    } else if (packageId === 'premium') {
      this.navigationService.navigateTo(this.config.stripePremiumUrl);
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
        await this.supabaseAuthService.deleteTokenTracker(this.profile.id);
      }
    } catch (error) {
      console.log(error);
    } finally {
      return;
    }
  }
} 