import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

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
  user: any = null;

  constructor(
    private router: Router,
    private supabaseAuthService: SupabaseAuthService
  ) {
    this.session = this.supabaseAuthService.session;
  }

  async ngOnInit() {
    const session = await this.supabaseAuthService.ensureSessionLoaded();
    if (session) {
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
  }

  async getFluxProfile(session: any) {
    try {
      this.user = session;
      const { data: profile, error, status } = await this.supabaseAuthService.fluxProfile(this.user.user.id);
      if (error) {
        throw error;
      }
      if (profile) {
        this.profile = null;
        this.profile = profile;
      }

      return;
    } catch (error: any) {
      if (error) {
        if (error.code === 'PGRST116' || error.message === 'JSON object requested, multiple (or no) rows returned') {
          await this.supabaseAuthService.createFluxProfile(this.user.user.id, this.user.user.email);
          await this.getFluxProfile(session);
        }
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
