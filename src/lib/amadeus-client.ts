import Amadeus from 'amadeus';

export function createAmadeusClient() {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  return new Amadeus({
    clientId,
    clientSecret,
    hostname: process.env.AMADEUS_ENVIRONMENT === 'production' ? 'production' : 'test',
  });
}
