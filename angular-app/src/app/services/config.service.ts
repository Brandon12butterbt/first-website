// config.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private env: any = {};

  setConfig(config: any) {
    this.env = config;
  }

  get supabaseUrl(): string {
    return this.env.SUPABASE_URL;
  }

  get supabaseAnonKey(): string {
    return this.env.SUPABASE_ANON_KEY;
  }

  get fluxApiKey(): string {
    return this.env.FLUX_API_KEY;
  }

  get fluxAccountId(): string {
    return this.env.FLUX_ACCOUNT_ID;
  }

  get stripePubKey(): string {
    return this.env.STRIPE_PUB_KEY;
  }

  get stripePriceId(): string {
    return this.env.STRIPE_PRICE_ID;
  }

  get stripeBasicUrl(): string {
    return this.env.STRIPE_BASIC_URL;
  }

  get stripeStandardUrl(): string {
    return this.env.STRIPE_STANDARD_URL;
  }

  get stripePremiumUrl(): string {
    return this.env.STRIPE_PREMIUM_URL;
  }
}
