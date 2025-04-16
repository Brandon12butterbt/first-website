import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private authState = new BehaviorSubject<{email: string, profile: any} | null>(null);
  authState$ = this.authState.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.initAuthListener();
  }

  private async initAuthListener() {
    // Listen to Supabase auth changes
    this.supabaseService.authChanges((event, session) => {
      this.handleAuthState();
    });

    // Initial check
    await this.handleAuthState();
  }

  private async handleAuthState() {
    const user = this.supabaseService.currentUser;
    
    if (!user) {
      this.router.navigate(['/login']);
      this.authState.next(null);
      return;
    }
    
    const profile = await this.supabaseService.getProfile();
    this.authState.next({
      email: user.email || '',
      profile
    });
  }

  async signOut() {
    await this.supabaseService.signOut();
  }
}