export const environment = {
  production: true,
  supabase: {
    url: '%%SUPABASE_URL%%',
    anonKey: '%%SUPABASE_ANON_KEY%%'
  },
  stripe: {
    publishableKey: '%%STRIPE_PUB_KEY%%',
    priceId: '%%STRIPE_PRICE_ID%%',
    basicTokenUrl: '%%STRIPE_BASIC_URL%%',
    standardTokenUrl: '%%STRIPE_STANDARD_URL%%',
    premiumTokenUrl: '%%STRIPE_PREMIUM_URL%%',
  },
  flux: {
    apiKey: '%%FLUX_API_KEY%%',
    accountId: '%%FLUX_ACCOUNT_ID%%'
  }
}; 