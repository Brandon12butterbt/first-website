import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StripeService, CreditPackage } from '../../services/stripe.service';
import { SupabaseService } from '../../services/supabase.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../shared/nav-bar.component';
import { environment } from '../../../environments/environment';
import { PaymentService } from '../../services/payment.service';

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
    RouterModule,
    NavBarComponent
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
    private paymentService: PaymentService
  ) {}
  
  ngOnInit() {
    this.creditPackages = this.stripeService.creditPackages;
    this.loadUserProfile().then(() => {
      this.isLoading = false;
    });
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
    // this.isPurchasing = true;
    
    // try {
    //   await this.stripeService.redirectToCheckout(packageId);
    // } catch (error: any) {
    //   console.error('Error redirecting to checkout:', error);
    //   alert('Error processing payment: ' + error.message);
    // } finally {
    //   this.isPurchasing = false;
    // }
    this.paymentService.setApiCallMade(true);
    window.location.href = environment.stripe.baseUrl;
  }
  
  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/login']);
  }
} 