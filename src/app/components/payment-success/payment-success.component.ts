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
import { NavBarComponent } from '../shared/nav-bar.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile().then(() => {
      this.isLoading = false;
    });
  }

  async loadUserProfile() {
    const user = this.supabaseService.currentUser;
    if (!user) {
      console.log('No user found: ', user);
      this.router.navigate(['/login']);
      return;
    }
    
    this.userEmail = user.email || '';
    this.profile = await this.supabaseService.getProfile();
  }

  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/login']);
  }
}
