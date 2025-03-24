import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SupabaseClientService } from './services/supabase-client.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'AFluxGen AI Image Generator';

  constructor(
    private supabaseClientService: SupabaseClientService,
    private router: Router
  ) {}

  ngOnInit() {
    this.supabaseClientService.waitForSession().subscribe(session => {
      if (session && window.location.pathname === '/login') {
        this.router.navigate(['/generate']);
      }
      
      const isAuthPage = ['/login', '/signup', '/reset-password'].includes(window.location.pathname);
      if (!session && !isAuthPage) {
        this.router.navigate(['/login']);
      }
    });
  }
}
