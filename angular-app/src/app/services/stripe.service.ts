import { Injectable } from '@angular/core';
import { CREDIT_PACKAGES, CreditPackage, getCreditPackageById } from '../components/shared/credit-packages';

import { SupabaseAuthService } from './supabase-auth.service';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  
  creditPackages: CreditPackage[] = CREDIT_PACKAGES;
  
  constructor(
    private supabaseAuthService: SupabaseAuthService
  ) {}
  
  async handlePaymentSuccess(profile: any, packageId: string): Promise<number> {
    const creditPackage = getCreditPackageById(packageId);
    
    if (creditPackage) {
      const newCredits = profile.credits + creditPackage.credits;
      await this.supabaseAuthService.updateCredits(profile.id, newCredits);
      return newCredits;
    }

    return 0;
  }
} 