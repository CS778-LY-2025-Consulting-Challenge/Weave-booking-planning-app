'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle, AlertTriangle, XCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SafetyData {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  newsItems: string[];
  sources?: string[];
  lastUpdated: string;
  articlesAnalyzed: number;
}

interface TravelSafetyCardProps {
  destination: string;
  dates?: {
    start: string;
    end: string;
  };
}

export default function TravelSafetyCard({ destination, dates }: TravelSafetyCardProps) {
  const [safetyData, setSafetyData] = useState<SafetyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchSafetyData = async () => {
    if (!destination) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/travel-safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, dates }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch safety data');
      }

      const data = await response.json();
      setSafetyData(data);
    } catch (err: any) {
      console.error('[TravelSafetyCard] Error:', err);
      setError(err.message || 'Failed to load safety information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSafetyData();
  }, [destination]);

  const getRiskConfig = (level: string) => {
    switch (level) {
      case 'low':
        return {
          icon: <Shield className="h-5 w-5" />,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          label: 'Low Risk',
        };
      case 'medium':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          label: 'Medium Risk',
        };
      case 'high':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          label: 'High Risk',
        };
      case 'critical':
        return {
          icon: <XCircle className="h-5 w-5" />,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          label: 'Critical Risk',
        };
      default:
        return {
          icon: <Shield className="h-5 w-5" />,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          label: 'Unknown',
        };
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now.getTime() - updated.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  if (!destination) return null;

  return (
    <Card className="border-0 bg-white shadow-2xl shadow-slate-200/50 rounded-3xl pt-3 pb-3 overflow-hidden">
      <CardHeader className="pb-0.5 pt-0 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-base font-bold">Travel Safety Alert</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchSafetyData}
              disabled={isLoading}
              className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100"
            >
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-2 pt-2 pb-1 px-8">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                <p className="text-sm text-slate-500">Analyzing travel safety...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!isLoading && !error && safetyData && (
            <>
              {/* Destination and Risk Level */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-900">{destination}</div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 shadow-sm ${getRiskConfig(safetyData.riskLevel).bg} ${getRiskConfig(safetyData.riskLevel).border}`}>
                  <span className={getRiskConfig(safetyData.riskLevel).color}>
                    {React.cloneElement(getRiskConfig(safetyData.riskLevel).icon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5' })}
                  </span>
                  <span className={`text-sm font-bold ${getRiskConfig(safetyData.riskLevel).color}`}>
                    {getRiskConfig(safetyData.riskLevel).label}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200/50 p-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {safetyData.summary}
                </p>
              </div>

              {/* Key Updates */}
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Recent Updates
                </h4>
                <div className="space-y-2.5">
                  {safetyData.newsItems.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      <p className="text-sm text-slate-600 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
