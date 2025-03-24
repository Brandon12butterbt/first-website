import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StripeService, CreditPackage } from '../../services/stripe.service';
import { SupabaseService } from '../../services/supabase.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  template: `
    <div class="min-h-screen bg-gray-900 flex flex-col">
      <!-- Top Navigation -->
      <mat-toolbar class="bg-gray-800 border-b border-gray-700">
        <div class="container mx-auto flex items-center justify-center">
          <a routerLink="/dashboard" class="text-xl font-bold text-purple-400 mr-6">AFluxGen</a>
          
          <button mat-button routerLink="/dashboard" class="text-white hover:bg-gray-700 mx-2">
            <mat-icon>dashboard</mat-icon>
            <span class="ml-1">Dashboard</span>
          </button>
          
          <div *ngIf="profile" class="px-2 py-0.5 bg-gray-700 rounded-full flex items-center mx-2 text-sm">
            <mat-icon class="text-yellow-400 mr-1" style="font-size: 16px; height: 16px; width: 16px; line-height: 16px;">stars</mat-icon>
            <span class="text-white">{{ profile.credits }} credits</span>
          </div>
          
          <button mat-button routerLink="/generate" class="text-white hover:bg-gray-700 mx-2">
            <mat-icon>add_photo_alternate</mat-icon>
            <span class="ml-1">Generate</span>
          </button>
        </div>
      </mat-toolbar>
      
      <!-- Main Content -->
      <div class="flex-1 p-6">
        <h1 class="text-2xl font-bold text-white mb-2">Upgrade Your Account</h1>
        <p class="text-gray-400 mb-8">Choose a credit package to generate more amazing AI images</p>
        
        <div *ngIf="isLoading" class="flex justify-center py-12">
          <mat-spinner></mat-spinner>
        </div>
        
        <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <mat-card *ngFor="let pack of creditPackages" class="bg-gray-800 overflow-hidden relative">
            <div class="absolute top-0 right-0 px-4 py-2 bg-gray-700 text-white rounded-bl-lg">
              {{ formatPrice(pack.price) }}
            </div>
            
            <div class="pt-8 px-6 pb-6 text-center">
              <h2 class="text-xl font-bold text-white mb-2">{{ pack.name }} Pack</h2>
              <div class="text-4xl font-bold text-purple-400 my-4 flex items-center justify-center">
                <mat-icon class="text-yellow-400 mr-2">stars</mat-icon>
                {{ pack.credits }}
              </div>
              <p class="text-gray-400 mb-6">Credits</p>
              
              <button 
                mat-raised-button 
                color="primary" 
                (click)="purchaseCredits(pack.id)" 
                class="w-full bg-purple-600 hover:bg-purple-700 py-2"
                [disabled]="isPurchasing">
                <span *ngIf="!isPurchasing">
                  <mat-icon>shopping_cart</mat-icon>
                  <span class="text-white">Purchase</span>
                </span>
                <span *ngIf="isPurchasing">
                  <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                  <span class="text-white">Processing...</span>
                </span>
              </button>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="px-6 py-4">
              <ul class="text-gray-300">
                <li class="flex items-center mb-2">
                  <mat-icon class="text-green-500 mr-2">check_circle</mat-icon>
                  Generate {{ pack.credits }} images
                </li>
                <li class="flex items-center mb-2">
                  <mat-icon class="text-green-500 mr-2">check_circle</mat-icon>
                  High quality AI images
                </li>
                <li class="flex items-center">
                  <mat-icon class="text-green-500 mr-2">check_circle</mat-icon>
                  Download and edit images
                </li>
              </ul>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UpgradeComponent implements OnInit {
  profile: any = null;
  isLoading: boolean = true;
  isPurchasing: boolean = false;
  creditPackages: CreditPackage[] = [];
  
  constructor(
    private stripeService: StripeService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadUserProfile();
    this.creditPackages = this.stripeService.creditPackages;
    this.isLoading = false;
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
    
    this.profile = await this.supabaseService.getProfile();
  }
  
  async purchaseCredits(packageId: string) {
    this.isPurchasing = true;
    
    try {
      await this.stripeService.redirectToCheckout(packageId);
    } catch (error: any) {
      console.error('Error redirecting to checkout:', error);
      alert('Error processing payment: ' + error.message);
    } finally {
      this.isPurchasing = false;
    }
  }
} 