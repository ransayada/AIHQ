declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      PORT?: string;

      // Clerk
      CLERK_SECRET_KEY: string;
      CLERK_WEBHOOK_SECRET: string;

      // Database
      DATABASE_URL: string;
      DIRECT_URL?: string;

      // Redis
      REDIS_URL: string;

      // Stripe
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
      STRIPE_PRO_PRICE_ID: string;
      STRIPE_STUDIO_PRICE_ID: string;

      // Anthropic
      ANTHROPIC_API_KEY: string;

      // Cloudflare R2
      R2_ACCOUNT_ID: string;
      R2_ACCESS_KEY_ID: string;
      R2_SECRET_ACCESS_KEY: string;
      R2_BUCKET_NAME: string;
      R2_PUBLIC_URL: string;

      // App
      ALLOWED_ORIGINS: string;
      APP_URL: string;
      INTERNAL_WEBHOOK_SECRET: string;
    }
  }
}

export {};
