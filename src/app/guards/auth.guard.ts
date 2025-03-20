import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseClientService } from '../services/supabase-client.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private supabaseClientService: SupabaseClientService
  ) {}

  canActivate(): Observable<boolean> {
    return this.supabaseClientService.waitForSession().pipe(
      map(session => {
        if (session) {
          //Auth guard: Session found, allowing access
          return true;
        }
        //Auth guard: No session found, redirecting to login
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
} 