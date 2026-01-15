'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function TestFlightsPage() {
  const [fromCity, setFromCity] = useState('Shanghai');
  const [toCity, setToCity] = useState('Tokyo');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testAviationstack = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/test-aviationstack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromCity, to: toCity }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'API call failed');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Aviationstack API Test</h1>

        <Card>
          <CardHeader>
            <CardTitle>Test Flight Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">From City</label>
                <Input
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="e.g., Shanghai"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">To City</label>
                <Input
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="e.g., Tokyo"
                />
              </div>
            </div>

            <Button onClick={testAviationstack} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Aviationstack API'
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="text-green-600">Success ✓</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Flight Details:</h3>
                  <div className="bg-gray-100 p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Airline:</strong> {result.airline || 'N/A'}</p>
                    <p><strong>Airline Code:</strong> {result.airlineCode || 'N/A'}</p>
                    <p><strong>Flight Number:</strong> {result.flightNumber || 'N/A'}</p>
                    <p><strong>From:</strong> {result.fromCode || 'N/A'}</p>
                    <p><strong>To:</strong> {result.toCode || 'N/A'}</p>
                    <p><strong>Duration:</strong> {result.duration || 'N/A'}</p>
                    <p><strong>Time:</strong> {result.time || 'N/A'}</p>
                    <p><strong>Date:</strong> {result.date || 'N/A'}</p>
                    <p><strong>Aircraft:</strong> {result.aircraft || 'N/A'}</p>
                    <p><strong>Price:</strong> {result.price || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Raw API Response:</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                    {JSON.stringify(result.rawData, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

