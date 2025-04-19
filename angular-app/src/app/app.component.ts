import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SupabaseClientService } from './services/supabase-client.service';
import { SupabaseService } from './services/supabase.service';
import { PaymentService } from './services/payment.service';

import { NavBarComponent } from './components/shared/nav-bar/nav-bar.component';
import { SupabaseAuthService } from './services/supabase-auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AFluxGen AI Image Generator';

  profile: any = null;
  userEmail: string = '';

  session: any = null;

  constructor(
    private supabaseClientService: SupabaseClientService,
    private router: Router,
    private supabaseService: SupabaseService,
    private paymentService: PaymentService,
    private supabaseAuthService: SupabaseAuthService
  ) {
    this.session = this.supabaseAuthService.session;
  }

  async ngOnInit() {
    const session = await this.supabaseAuthService.ensureSessionLoaded();
    if (session) {
      console.log('testing session on refresh ', this.session);
      this.session = session;
      this.getFluxProfile(session).then(() => {
        this.userEmail = this.profile.email;
      });
    }

    this.supabaseAuthService.authChanges((event, session) => {
      this.session = session;
      this.getFluxProfile(session).then(() => {
        if (this.profile) {
          this.userEmail = this.profile.email;
        }
      });
    });

    // this.authService.authState$.subscribe(state => {
    //   if (state) {
    //     this.userEmail = state.email;
    //     this.profile = state.profile;
    //   } else {
    //     this.userEmail = '';
    //     this.profile = null;
    //   }
    // });

    // const apiCallMade = JSON.parse(sessionStorage.getItem('apiCallMade') || 'false');
    // this.paymentService.setApiCallMade(apiCallMade);


    // this.supabaseClientService.waitForSession().subscribe(session => {
    //   if (session && window.location.pathname === '/login') {
    //     this.router.navigate(['/']);
    //   }
      
    //   const isAuthPage = ['/login', '/signup', '/reset-password'].includes(window.location.pathname);
    //   if (!session && !isAuthPage) {
    //     this.router.navigate(['/']);
    //   }
    // });
  }

  async checkSession() {
    const user = this.supabaseService.currentUser;
    if (!user) {
      this.router.navigate(['/']);
    }
  }

  async loadUserData() {
    const user = this.supabaseService.currentUser;
    if (!user) {
      return;
    }
    
    this.userEmail = user.email || '';
    this.profile = await this.supabaseService.getProfile();
  }

  async getFluxProfile(session: any) {
    try {
      const { user } = session;
      const { data: profile, error, status } = await this.supabaseAuthService.fluxProfile(user.id);
      if (error && status !== 406) {
        throw error;
      }
      if (profile) {
        console.log('updating profile from app.component.ts');
        this.profile = null;
        this.profile = profile;
      }
    } catch (error) {
      if (error instanceof Error) {
        this.router.navigate(['/']);
      }
    }
  }

  async signOut() {
    await this.supabaseAuthService.signOut();
    this.userEmail = '';
    this.profile = null;
    this.router.navigate(['/']);
  }
}
