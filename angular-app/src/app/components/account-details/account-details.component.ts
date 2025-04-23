import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { SupabaseAuthService } from '../../services/supabase-auth.service';

interface Profile {
  id: string;
  email: string;
  credits: number;
  images_generated: number;
  created_at: string;
}

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css']
})
export class AccountDetailsComponent implements OnInit {
  profile: Profile | null = null;
  isLoading = true;
  session: any = null;

  constructor(private supabaseAuthService: SupabaseAuthService) {}

  async ngOnInit() {
    this.isLoading = true;

    const loadingTimeout = setTimeout(() => {
      if (this.isLoading) {
        console.warn('Timeout reached: forcing isLoading = false');
        this.isLoading = false;
      }
    }, 8000);

    const session = await this.supabaseAuthService.getSession();
    this.session = session;

    if (session) {
      await this.getFluxProfile(session);
    } else {
      this.profile = null;
    }

    clearTimeout(loadingTimeout);
    this.isLoading = false;
  }

  async getFluxProfile(session: any) {
    try {
      const { user } = session;
      console.log('fetcching in account details', user.id);
      const { data: profile, error } = await this.supabaseAuthService.fluxProfile(user.id);
      if (error) {
        throw error;
      }
      if (profile) {
        this.profile = null;
        this.profile = profile;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
      }
    } finally {
      this.isLoading = false;
    }
  }
}
