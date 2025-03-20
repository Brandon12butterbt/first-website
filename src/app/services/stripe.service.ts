import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: Promise<Stripe | null>;
  
  // Credit packages
  creditPackages: CreditPackage[] = [
    { id: 'basic', name: 'Basic', credits: 10, price: 4.99 },
    { id: 'standard', name: 'Standard', credits: 50, price: 19.99 },
    { id: 'premium', name: 'Premium', credits: 120, price: 39.99 }
  ];
  
  constructor(
    private http: HttpClient,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.stripe = loadStripe(environment.stripe.publishableKey);
  }
  
  async redirectToCheckout(packageId: string): Promise<void> {
    const user = this.supabaseService.currentUser;
    if (!user) {
      throw new Error('User must be logged in');
    }
    
    // Get the credit package
    const creditPackage = this.creditPackages.find(p => p.id === packageId);
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
      
      // Redirect back to dashboard
      this.router.navigate(['/dashboard'], { 
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
    // In a real implementation, this would verify the session on the server
    // and then credit the user's account
    
    // For demo purposes, we're just adding credits directly
    const profile = await this.supabaseService.getProfile();
    if (profile) {
      const creditPackage = this.creditPackages.find(p => p.id === packageId);
      
      if (creditPackage) {
        const newCredits = profile.credits + creditPackage.credits;
        await this.supabaseService.updateCredits(newCredits);
        console.log(`Added ${creditPackage.credits} credits. New balance: ${newCredits}`);
      }
    }
  }
} 