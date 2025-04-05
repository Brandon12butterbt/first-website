import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  constructor(private http: HttpClient) {}

  getSupabaseUrl() {
    return this.http.get<any>('/api/supabase_url');
  }

  getSupabaseAnonKey() {
    return this.http.get<any>('/api/supabase_anon_key');
  }

  getFluxApiKey() {
    return this.http.get<any>('api/flux_api_key');
  }

  getFluxAccountId() {
    return this.http.get<any>('api/flux_account_id');
  }

  getStripePubKey() {
    return this.http.get<any>('api/stripe_pub_key');
  }

  getStripePriceId() {
    return this.http.get<any>('api/stripe_price_id');
  }

  getStripeBasicUrl() {
    return this.http.get<any>('api/stripe_basic_url');
  }

  getStripeStandardUrl() {
    return this.http.get<any>('api/stripe_standard_url');
  }

  getStripePremiumUrl() {
    return this.http.get<any>('api/stripe_premium_url');
  }
}
