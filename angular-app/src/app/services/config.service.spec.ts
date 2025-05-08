import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  const mockConfig = {
    SUPABASE_URL: 'https://supabase.example.com',
    SUPABASE_ANON_KEY: 'anon-key',
    FLUX_API_KEY: 'flux-key',
    FLUX_ACCOUNT_ID: 'flux-id',
    STRIPE_PUB_KEY: 'stripe-pub',
    STRIPE_PRICE_ID: 'price-id',
    STRIPE_BASIC_URL: 'https://stripe.com/basic',
    STRIPE_STANDARD_URL: 'https://stripe.com/standard',
    STRIPE_PREMIUM_URL: 'https://stripe.com/premium',
    TURN_WIDGET_SITE_KEY: 'turn-key'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigService);
    service.setConfig(mockConfig);
  });

  it('should return correct Supabase URL', () => {
    expect(service.supabaseUrl).toBe(mockConfig.SUPABASE_URL);
  });

  it('should return correct Supabase Anon Key', () => {
    expect(service.supabaseAnonKey).toBe(mockConfig.SUPABASE_ANON_KEY);
  });

  it('should return correct Flux API Key', () => {
    expect(service.fluxApiKey).toBe(mockConfig.FLUX_API_KEY);
  });

  it('should return correct Flux Account ID', () => {
    expect(service.fluxAccountId).toBe(mockConfig.FLUX_ACCOUNT_ID);
  });

  it('should return correct Stripe Public Key', () => {
    expect(service.stripePubKey).toBe(mockConfig.STRIPE_PUB_KEY);
  });

  it('should return correct Stripe Price ID', () => {
    expect(service.stripePriceId).toBe(mockConfig.STRIPE_PRICE_ID);
  });

  it('should return correct Stripe URLs', () => {
    expect(service.stripeBasicUrl).toBe(mockConfig.STRIPE_BASIC_URL);
    expect(service.stripeStandardUrl).toBe(mockConfig.STRIPE_STANDARD_URL);
    expect(service.stripePremiumUrl).toBe(mockConfig.STRIPE_PREMIUM_URL);
  });

  it('should return correct TURN widget site key', () => {
    expect(service.turnWidgetSiteKey).toBe(mockConfig.TURN_WIDGET_SITE_KEY);
  });
});