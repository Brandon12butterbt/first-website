import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SupabaseAuthService } from '../../services/supabase-auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userEmail: string = '';
  profile: any = null;
  session: any = null;
  
  constructor(
    private supabaseAuthService: SupabaseAuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const session = await this.supabaseAuthService.ensureSessionLoaded();

    if (session) {
      this.session = session;
      this.getProfile(session).then(() => {
        if (this.profile) {
          this.userEmail = this.profile.email;
        }
      });
    }

    this.supabaseAuthService.authChanges((event, session) => {
      this.session = session;
      if (this.session) {
        this.getProfile(session).then(() => {
          if (this.profile) {
            this.userEmail = this.profile.email;
          }
        });
      } else {
        this.profile = null;
      }
    });

    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  async getProfile(session: any) {
    try {
      const { user } = session;
      const { data: profile, error, status } = await this.supabaseAuthService.profile(user);

      if (error && status !== 406) {
        throw error;
      }
      if (profile) {
        this.profile = profile;
      }
    } catch (error) {
      console.log(error);
    }
  }
} 