import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { NavBarComponent } from '../shared/nav-bar/nav-bar.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StripeService } from '../../services/stripe.service';

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
    RouterModule,
    NavBarComponent
  ],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent {
  profile: any = null;
  userEmail: string = '';
  isLoading: boolean = true;
  token: any = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private stripeService: StripeService
  ) {}

  ngOnInit() {
    this.handleTokenTracker().then(() => {
      this.isLoading = false;
    });
  }

  async handleTokenTracker() {
    const user = this.checkUser();

    this.token = await this.supabaseService.getTokenTracker();

    if (!this.token) {
      this.router.navigate(['/']);
      return;
    }

    const sessionToken = sessionStorage.getItem('token');

    if (sessionToken) {
      if (sessionToken !== this.token.unique_id) {
        // Session token does not match database token, redirect to home page
        sessionStorage.setItem('token', '');
        await this.supabaseService.deleteTokenTracker();
        this.router.navigate(['/']);
      }
      
      // Session token matches database token, proceed with payment success
      await this.stripeService.handlePaymentSuccess(this.token.package_type);
      sessionStorage.setItem('token', '');
      await this.supabaseService.deleteTokenTracker();

      this.userEmail = user.email || '';
      this.profile = await this.supabaseService.getProfile();

      await this.supabaseService.savePurchase(this.token);
    } else {
      // Session token not found, redirect to home page
      await this.supabaseService.deleteTokenTracker();
      this.router.navigate(['/']);
    }

  }

  checkUser(): any {
    const user = this.supabaseService.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    } else {
      return user;
    }
  }

  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/login']);
  }
}
