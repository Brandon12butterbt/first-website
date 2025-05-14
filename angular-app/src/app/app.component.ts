import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { NavBarComponent } from './components/shared/nav-bar/nav-bar.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { SupabaseAuthService } from './services/supabase-auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('contentDiv') contentDiv!: ElementRef;

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
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.contentDiv?.nativeElement) {
          this.contentDiv.nativeElement.scrollTop = 0;
        }
      });

    const session = await this.supabaseAuthService.ensureSessionLoaded();
    if (session) {
      this.session = session;
      this.getFluxProfile(session).then(() => {
        this.userEmail = this.profile.email;
      });
    }

    this.supabaseAuthService.authChanges((event, session) => {
      this.session = session;
    
      if (event === 'SIGNED_OUT' || !session) {
        this.profile = null;
        this.user = null;
        this.userEmail = '';
        return;
      }
    
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
