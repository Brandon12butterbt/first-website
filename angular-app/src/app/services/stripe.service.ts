import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from './supabase.service';
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
    private supabaseService: SupabaseService,
    private router: Router,
    public config: ConfigService,
    private supabaseAuthService: SupabaseAuthService
  ) {
    this.stripe = loadStripe(this.config.stripePubKey);
  }
  
  async redirectToCheckout(packageId: string): Promise<void> {
    const user = this.supabaseService.currentUser;
    if (!user) {
      throw new Error('User must be logged in');
    }
    
    // Get the credit package
    const creditPackage = getCreditPackageById(packageId);
    if (!creditPackage) {
      throw new Error('Invalid package');
    }
    
    try {
      const stripe = await this.stripe;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }
      
      // In a real implementation, we would create a checkout session on the server
      // For demo purposes, we're going to simulate a successful payment
      console.log(`Processing payment for ${creditPackage.name} package (${creditPackage.credits} credits)`);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add credits directly to the user's account for testing
      await this.handlePaymentSuccess(creditPackage.id);
      
      // Redirect back to gallery
      this.router.navigate(['/gallery'], { 
        queryParams: { 
          payment: 'success',
          package: creditPackage.name,
          credits: creditPackage.credits
        }
      });
      
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
  
  async handlePaymentSuccess(packageId: string): Promise<void> {
    const profile = await this.supabaseService.getProfile();
    if (profile) {
      const creditPackage = getCreditPackageById(packageId);
      
      if (creditPackage) {
        const newCredits = profile.credits + creditPackage.credits;
        // await this.supabaseService.updateCredits(newCredits);
        await this.supabaseAuthService.updateCredits(profile.id, newCredits);
      }
    }
  }
} 