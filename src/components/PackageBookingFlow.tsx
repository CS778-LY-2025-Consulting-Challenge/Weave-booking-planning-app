"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Crown, MapPin, CreditCard, Check } from 'lucide-react';
import { LuxuryPackage } from '@/lib/packages';
import { useRouter } from 'next/navigation';

interface Props {
  pkg: LuxuryPackage;
}

export default function PackageBookingFlow({ pkg }: Props) {
  const router = useRouter();
  // Steps: 0-config, 1-guests, 2-addons, 3-payment
  const [step, setStep] = useState(0);

  const [dates, setDates] = useState<{ start?: string; end?: string }>({});
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [tier, setTier] = useState<'Suite' | 'Villa' | 'Private'>('Suite');

  const [travelers, setTravelers] = useState(
    Array.from({ length: guests }, () => ({ name: '', email: '', phone: '', country: '', requests: '', dietary: '' }))
  );

  const [addons, setAddons] = useState<{ transfers: boolean; privateGuide: boolean; helicopter: boolean; spa: boolean }>({
    transfers: true,
    privateGuide: false,
    helicopter: false,
    spa: false,
  });

  const basePerPerson = pkg.price;
  const tierMultiplier = tier === 'Suite' ? 1.2 : tier === 'Villa' ? 1.45 : 1.8;
  const addonsTotal = useMemo(() => {
    let t = 0;
    if (addons.transfers) t += 150 * guests;
    if (addons.privateGuide) t += 400 * guests;
    if (addons.helicopter) t += 1200;
    if (addons.spa) t += 250 * guests;
    return t;
  }, [addons, guests]);
  const subtotal = Math.round(basePerPerson * tierMultiplier * guests);
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes + addonsTotal;

  useEffect(() => {
    setTravelers(Array.from({ length: guests }, () => ({ name: '', email: '', phone: '', country: '', requests: '', dietary: '' })));
  }, [guests]);

  const stepTitles = ['Trip configuration', 'Guest details', 'Enhancements & add-ons', 'Payment & confirmation'];

  const onConfirm = () => {
    const booking = {
      type: 'package' as const,
      confirmationNumber: 'WV' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      bookingDate: new Date().toISOString().split('T')[0],
      destination: pkg.destination,
      startDate: dates.start || new Date().toISOString().split('T')[0],
      endDate: dates.end || new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString().split('T')[0],
      travelers: guests,
      price: total,
      name: travelers[0]?.name || 'Guest Traveler',
      email: travelers[0]?.email || 'guest@example.com',
      phone: travelers[0]?.phone || '',
      packageDetails: {
        name: pkg.name,
        duration: pkg.duration,
        includes: pkg.includes,
      },
    };
    localStorage.setItem('latestBooking', JSON.stringify(booking));
    router.push('/booking-confirmation');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-20 md:top-24 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <div className="flex items-center gap-2 text-gray-700"><MapPin className="size-4" />{pkg.destination}</div>
            <div className="text-lg font-semibold text-gray-900">{pkg.name}</div>
            <div className="text-sm text-gray-600">{pkg.duration}</div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-gray-500">From</div>
            <div className="text-2xl font-bold text-gray-900">${pkg.price.toLocaleString()} <span className="text-sm font-medium">pp</span></div>
          </div>
        </div>
        {/* Step indicator */}
        <div className="mx-auto max-w-6xl px-4 pb-4">
          <div className="grid grid-cols-4 gap-2">
            {stepTitles.map((title, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`h-2 w-full rounded ${i <= step ? 'bg-gray-900' : 'bg-gray-200'}`} />
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-700">{stepTitles[step]}</div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Step 1: Configuration */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardContent className="space-y-4 p-6">
                <div>
                  <Label className="text-gray-700">Travel dates</Label>
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input type="date" value={dates.start || ''} onChange={(e) => setDates((d) => ({ ...d, start: e.target.value }))} />
                    <Input type="date" value={dates.end || ''} onChange={(e) => setDates((d) => ({ ...d, end: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <Label>Guests</Label>
                    <Input type="number" min={1} max={12} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Rooms</Label>
                    <Input type="number" min={1} max={6} value={rooms} onChange={(e) => setRooms(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Experience tier</Label>
                    <Select value={tier} onValueChange={(v) => setTier(v as any)}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Suite">Suite</SelectItem>
                        <SelectItem value="Villa">Villa</SelectItem>
                        <SelectItem value="Private">Private tour upgrades</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => router.push(`/packages/${pkg.id}`)}>Back</Button>
                  <Button onClick={() => setStep(1)} className="bg-black text-white hover:bg-gray-800">Continue</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-2 text-xs uppercase tracking-wider text-gray-500">Price summary</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Base × {guests}</span><span>${(basePerPerson * guests).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Tier multiplier</span><span>× {tierMultiplier.toFixed(2)}</span></div>
                  <Separator />
                  <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Taxes (12%)</span><span>${taxes.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Add-ons</span><span>${addonsTotal.toLocaleString()}</span></div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>${total.toLocaleString()}</span></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Guests */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {Array.from({ length: guests }).map((_, i) => (
              <Card key={i}>
                <CardContent className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                  <div>
                    <Label>Full name</Label>
                    <Input value={travelers[i]?.name || ''} onChange={(e) => setTravelers((t) => { const c=[...t]; c[i].name=e.target.value; return c; })} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={travelers[i]?.email || ''} onChange={(e) => setTravelers((t) => { const c=[...t]; c[i].email=e.target.value; return c; })} placeholder="john@example.com" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={travelers[i]?.phone || ''} onChange={(e) => setTravelers((t) => { const c=[...t]; c[i].phone=e.target.value; return c; })} placeholder="+1 555 000 0000" />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input value={travelers[i]?.country || ''} onChange={(e) => setTravelers((t) => { const c=[...t]; c[i].country=e.target.value; return c; })} placeholder="United States" />
                  </div>
                  <div>
                    <Label>Special requests</Label>
                    <Input value={travelers[i]?.requests || ''} onChange={(e) => setTravelers((t) => { const c=[...t]; c[i].requests=e.target.value; return c; })} placeholder="Dietary, accessibility, preferences" />
                  </div>
                  <div>
                    <Label>Dietary needs</Label>
                    <Input value={travelers[i]?.dietary || ''} onChange={(e) => setTravelers((t) => { const c=[...t]; c[i].dietary=e.target.value; return c; })} placeholder="Vegan, Gluten-free" />
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={() => setStep(2)} className="bg-black text-white hover:bg-gray-800">Continue</Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Add-ons */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">Private airport transfers</div>
                        <div className="text-xs text-gray-600">Dedicated chauffeur, round-trip</div>
                      </div>
                      <Badge className="bg-gray-900 text-white">$150 pp</Badge>
                    </div>
                    <div className="mt-3">
                      <Button variant={addons.transfers ? 'default' : 'outline'} onClick={() => setAddons((a) => ({ ...a, transfers: !a.transfers }))}>
                        {addons.transfers ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">Private guides</div>
                        <div className="text-xs text-gray-600">Curated tours with experts</div>
                      </div>
                      <Badge className="bg-gray-900 text-white">$400 pp</Badge>
                    </div>
                    <div className="mt-3">
                      <Button variant={addons.privateGuide ? 'default' : 'outline'} onClick={() => setAddons((a) => ({ ...a, privateGuide: !a.privateGuide }))}>
                        {addons.privateGuide ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">Helicopter experience</div>
                        <div className="text-xs text-gray-600">Scenic flight over highlights</div>
                      </div>
                      <Badge className="bg-gray-900 text-white">$1200</Badge>
                    </div>
                    <div className="mt-3">
                      <Button variant={addons.helicopter ? 'default' : 'outline'} onClick={() => setAddons((a) => ({ ...a, helicopter: !a.helicopter }))}>
                        {addons.helicopter ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">Spa & wellness</div>
                        <div className="text-xs text-gray-600">Premium treatments and rituals</div>
                      </div>
                      <Badge className="bg-gray-900 text-white">$250 pp</Badge>
                    </div>
                    <div className="mt-3">
                      <Button variant={addons.spa ? 'default' : 'outline'} onClick={() => setAddons((a) => ({ ...a, spa: !a.spa }))}>
                        {addons.spa ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} className="bg-black text-white hover:bg-gray-800">Continue</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-2 text-xs uppercase tracking-wider text-gray-500">Updated total</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Taxes</span><span>${taxes.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Add-ons</span><span>${addonsTotal.toLocaleString()}</span></div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>${total.toLocaleString()}</span></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Payment & confirmation */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Cardholder name</Label>
                    <Input placeholder="John Doe" />
                  </div>
                  <div>
                    <Label>Card number</Label>
                    <Input placeholder="1234 5678 9012 3456" />
                  </div>
                  <div>
                    <Label>Expiry / CVV</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="MM/YY" />
                      <Input placeholder="123" />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={onConfirm} className="bg-green-600 text-white hover:bg-green-700">
                    Confirm your ultra-luxury journey
                    <Check className="ml-2 size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-2 text-xs uppercase tracking-wider text-gray-500">Final breakdown</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Taxes</span><span>${taxes.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Add-ons</span><span>${addonsTotal.toLocaleString()}</span></div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>${total.toLocaleString()}</span></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
