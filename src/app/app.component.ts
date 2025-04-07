import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SupabaseClientService } from './services/supabase-client.service';
import { SupabaseService } from './services/supabase.service';
import { PaymentService } from './services/payment.service';

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
    private router: Router,
    private supabaseService: SupabaseService,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    const apiCallMade = JSON.parse(sessionStorage.getItem('apiCallMade') || 'false');
    this.paymentService.setApiCallMade(apiCallMade);

    this.supabaseClientService.waitForSession().subscribe(session => {
      if (session && window.location.pathname === '/login') {
        this.router.navigate(['/']);
      }
      
      const isAuthPage = ['/login', '/signup', '/reset-password'].includes(window.location.pathname);
      if (!session && !isAuthPage) {
        this.router.navigate(['/login']);
      }
      this.checkSession();
    });
  }

  async checkSession() {
    const user = this.supabaseService.currentUser; // Check if user is logged in
    if (!user) {
      this.router.navigate(['/login']); // Redirect to login if no user
    }
  }
}
