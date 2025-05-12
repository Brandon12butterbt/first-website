import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { SupabaseAuthService } from '../services/supabase-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private supabaseAuthService: SupabaseAuthService
  ) {}

  async canActivate(): Promise<boolean> {
    const session = await this.supabaseAuthService.ensureSessionLoaded();
    
    if (!session) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
} 