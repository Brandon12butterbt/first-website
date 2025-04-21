import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CREDIT_PACKAGES, CreditPackage, getCreditPackageById } from '../components/shared/credit-packages';
import { ConfigService } from './config.service';

import { SupabaseAuthService } from './supabase-auth.service';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: Promise<Stripe | null>;
  
  // Credit packages
  creditPackages: CreditPackage[] = CREDIT_PACKAGES;
  
  constructor(
    private http: HttpClient,
    private router: Router,
    public config: ConfigService,
    private supabaseAuthService: SupabaseAuthService
  ) {
    this.stripe = loadStripe(this.config.stripePubKey);
  }
  
  async handlePaymentSuccess(profile: any, packageId: string): Promise<number> {
    const creditPackage = getCreditPackageById(packageId);
    
    if (creditPackage) {
      const newCredits = profile.credits + creditPackage.credits;
      // await this.supabaseService.updateCredits(newCredits);
      await this.supabaseAuthService.updateCredits(profile.id, newCredits);
      return newCredits;
    }

    return 0;
  }
} 