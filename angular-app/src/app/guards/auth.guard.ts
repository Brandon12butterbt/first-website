import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

import { SupabaseAuthService } from '../services/supabase-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private supabaseAuthService: SupabaseAuthService
  ) {}

  async canActivate(): Promise<boolean> {
    // const user = this.supabaseService.currentUser;
    // if (!user) {
    //   this.router.navigate(['/login']);
    //   return false;
    // }
    // return true;
    const session = await this.supabaseAuthService.ensureSessionLoaded();
    if (!session) {
      console.log('No session, redirecting to home');
      this.router.navigate(['/']);
      return false;
    }
    console.log('Session exists, allowing access');
    return true;
  }
} 