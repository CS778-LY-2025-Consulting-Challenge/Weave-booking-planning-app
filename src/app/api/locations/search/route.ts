import { NextRequest, NextResponse } from 'next/server';
import { AIRPORTS } from '@/data/airports';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json([]);
    }

    const lowerQuery = query.toLowerCase();

    const results = AIRPORTS.filter(
        (airport) =>
            airport.city.toLowerCase().includes(lowerQuery) ||
            airport.code.toLowerCase().includes(lowerQuery) ||
            airport.country.toLowerCase().includes(lowerQuery) ||
            airport.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 20); // Limit to 20 results

    return NextResponse.json(results);
}
