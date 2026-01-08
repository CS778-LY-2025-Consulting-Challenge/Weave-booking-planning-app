import { NextResponse } from 'next/server';

/**
 * 诊断用户提供的 Google Key 到底能访问什么
 * 访问: http://localhost:3000/api/google-weather/test
 */
export async function GET() {
  const apiKey = 'AIzaSyDproAIf8ta-iqfpp1rAn26dTxcG6OIFvU';
  const results: any = {
    key: apiKey.substring(0, 10) + '...',
    tests: []
  };

  // 测试 1: 尝试访问 Google Air Quality API (最接近天气的产品)
  try {
    const aqUrl = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`;
    const res = await fetch(aqUrl, {
      method: 'POST',
      body: JSON.stringify({ location: { latitude: 35.6762, longitude: 139.6503 } })
    });
    const data = await res.json();
    results.tests.push({
      service: 'Google Air Quality API',
      status: res.ok ? 'SUCCESS' : 'FAIL',
      error: data.error?.message || (res.ok ? null : 'Unknown error')
    });
  } catch (e: any) {
    results.tests.push({ service: 'Google Air Quality API', error: e.message });
  }

  // 测试 2: 尝试访问常规 Geocoding (验证 Key 是否有效)
  try {
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Tokyo&key=${apiKey}`;
    const res = await fetch(geoUrl);
    const data = await res.json();
    results.tests.push({
      service: 'Google Geocoding API',
      status: data.status === 'OK' ? 'SUCCESS' : 'FAIL',
      error: data.error_message || data.status
    });
  } catch (e: any) {
    results.tests.push({ service: 'Google Geocoding API', error: e.message });
  }

  return NextResponse.json(results);
}

