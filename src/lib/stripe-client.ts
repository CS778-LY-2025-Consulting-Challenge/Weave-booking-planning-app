import Stripe from 'stripe';

export function createStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return secretKey ? new Stripe(secretKey, { apiVersion: '2023-10-16' }) : null;
}
