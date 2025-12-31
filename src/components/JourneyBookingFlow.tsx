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
import { Calendar, User, MapPin, CreditCard, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Journey {
  id: number;
  title: string;
  destination: string;
  duration: string;
  season: string;
  author: string;
  coverImage: string;
  description?: string;
  price?: number;
}

interface Props {
  journey: Journey;
  onClose?: () => void;
}

export default function JourneyBookingFlow({ journey, onClose }: Props) {
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

  const stepTitles = ['When & Who', 'Travelers Info', 'Enhancements', 'Payment & Confirm'];

  useEffect(() => {
    setTravelers(Array.from({ length: guests }, () => ({ name: '', email: '', phone: '', country: '', requests: '', dietary: '' })));
  }, [guests]);

  const tiers = {
    Suite: { price: 2500, perks: ['Luxury suite', 'Daily breakfast', 'Standard transfers'] },
    Villa: { price: 5200, perks: ['Private villa', 'Personal chef', 'Helicopter transfers'] },
    Private: { price: 9800, perks: ['Entire property', '24/7 concierge', 'Private jet access'] },
  };

  const addonsData = {
    transfers: { price: 400, label: 'Private airport transfers' },
    privateGuide: { price: 300, label: 'Private guide (daily)' },
    helicopter: { price: 2000, label: 'Helicopter tour' },
    spa: { price: 500, label: 'Spa & wellness package' },
  };

  const subtotal = useMemo(() => {
    let sum = tiers[tier].price * guests;
    if (addons.transfers) sum += addonsData.transfers.price * guests;
    if (addons.privateGuide) sum += addonsData.privateGuide.price * guests;
    if (addons.helicopter) sum += addonsData.helicopter.price * guests;
    if (addons.spa) sum += addonsData.spa.price * guests;
    return sum;
  }, [guests, tier, addons]);

  const taxes = Math.round(subtotal * 0.1);
  const total = subtotal + taxes;

  const onConfirm = () => {
    const booking = {
      journeyId: journey.id,
      journeyTitle: journey.title,
      destination: journey.destination,
      duration: journey.duration,
      season: journey.season,
      dates,
      guests,
      rooms,
      tier,
      travelers,
      addons,
      subtotal,
      taxes,
      total,
      bookingRef: 'JRN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    };
    localStorage.setItem('latestBooking', JSON.stringify(booking));
    toast.success('🎉 Journey booking confirmed! Check your email for details.');
    onClose?.();
    router.push('/booking-confirmation');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-20 md:top-24 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <div className="flex items-center gap-2 text-gray-700"><MapPin className="size-4" />{journey.destination}</div>
            <div className="text-lg font-semibold text-gray-900">{journey.title}</div>
            <div className="text-sm text-gray-600">{journey.duration}</div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-gray-500">Starting from</div>
            <div className="text-3xl font-bold text-gray-900">${tiers[tier].price.toLocaleString()} <span className="text-sm font-medium">per person</span></div>
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
        {/* Step 0: Dates & Guests */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardContent className="space-y-6 p-6">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="date" value={dates.start || ''} onChange={(e) => setDates({ ...dates, start: e.target.value })} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input id="end-date" type="date" value={dates.end || ''} onChange={(e) => setDates({ ...dates, end: e.target.value })} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="guests">Number of Travelers</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => setGuests(Math.max(1, guests - 1))}>−</Button>
                    <span className="text-2xl font-bold w-12 text-center">{guests}</span>
                    <Button variant="outline" size="sm" onClick={() => setGuests(guests + 1)}>+</Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="rooms">Number of Accommodations</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => setRooms(Math.max(1, rooms - 1))}>−</Button>
                    <span className="text-2xl font-bold w-12 text-center">{rooms}</span>
                    <Button variant="outline" size="sm" onClick={() => setRooms(rooms + 1)}>+</Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="tier">Accommodation Tier</Label>
                  <Select value={tier} onValueChange={(value) => setTier(value as typeof tier)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(tiers).map(([key]) => (
                        <SelectItem key={key} value={key}>{key}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Tier Perks</p>
                  <div className="space-y-1">
                    {tiers[tier].perks.map((perk, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{perk}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Base price</span><span>${tiers[tier].price}</span></div>
                  <div className="flex justify-between font-semibold"><span>For {guests} travelers</span><span>${(tiers[tier].price * guests).toLocaleString()}</span></div>
                </div>
                <Button onClick={() => setStep(1)} className="w-full bg-black text-white hover:bg-gray-800">Continue</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 1: Traveler Info */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <Card>
              <CardContent className="space-y-6 p-6">
                {travelers.map((traveler, i) => (
                  <div key={i} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <Label>Traveler {i + 1} name</Label>
                      <Input placeholder="John Doe" value={traveler.name} onChange={(e) => {
                        const updated = [...travelers];
                        updated[i].name = e.target.value;
                        setTravelers(updated);
                      }} className="mt-1" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input placeholder="john@example.com" type="email" value={traveler.email} onChange={(e) => {
                        const updated = [...travelers];
                        updated[i].email = e.target.value;
                        setTravelers(updated);
                      }} className="mt-1" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input placeholder="+1 234 567 8900" value={traveler.phone} onChange={(e) => {
                        const updated = [...travelers];
                        updated[i].phone = e.target.value;
                        setTravelers(updated);
                      }} className="mt-1" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="flex items-center justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={() => setStep(2)} className="bg-black text-white hover:bg-gray-800">Continue</Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Add-ons */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardContent className="space-y-4 p-6">
                {Object.entries(addonsData).map(([key, { price, label }]) => (
                  <div key={key} onClick={() => setAddons({ ...addons, [key]: !addons[key as keyof typeof addons] })} className="rounded-xl border p-4 cursor-pointer hover:border-amber-500 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">{label}</div>
                        <div className="text-xs text-gray-500">Enhance your experience</div>
                      </div>
                      <div className="text-right">
                        <input type="checkbox" checked={addons[key as keyof typeof addons]} onChange={() => {}} className="h-4 w-4" />
                        <p className="text-sm font-semibold mt-2">+${price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-2 text-xs uppercase tracking-wider text-gray-500">Order summary</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Base ({guests} travelers)</span><span>${(tiers[tier].price * guests).toLocaleString()}</span></div>
                  {addons.transfers && <div className="flex justify-between"><span>Transfers</span><span>+${addonsData.transfers.price * guests}</span></div>}
                  {addons.privateGuide && <div className="flex justify-between"><span>Private Guide</span><span>+${addonsData.privateGuide.price * guests}</span></div>}
                  {addons.helicopter && <div className="flex justify-between"><span>Helicopter</span><span>+${addonsData.helicopter.price}</span></div>}
                  {addons.spa && <div className="flex justify-between"><span>Spa</span><span>+${addonsData.spa.price}</span></div>}
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="flex justify-between font-semibold"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Taxes (10%)</span><span>${taxes}</span></div>
                  <div className="flex justify-between text-lg font-bold text-gray-900"><span>Total</span><span>${total.toLocaleString()}</span></div>
                </div>
                <Button onClick={() => setStep(3)} className="w-full mt-6 bg-black text-white hover:bg-gray-800">Continue to Payment</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Payment & Confirmation */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Cardholder name</Label>
                    <Input placeholder="John Doe" className="mt-1" />
                  </div>
                  <div>
                    <Label>Card number</Label>
                    <Input placeholder="1234 5678 9012 3456" className="mt-1" />
                  </div>
                  <div>
                    <Label>Expiry / CVV</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Input placeholder="MM/YY" />
                      <Input placeholder="123" />
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex gap-3">
                  <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900">Your payment is secure and encrypted. Your card details are never stored.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-2 text-xs uppercase tracking-wider text-gray-500">Final breakdown</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Taxes</span><span>${taxes.toLocaleString()}</span></div>
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="flex justify-between text-lg font-bold"><span>Total Amount</span><span>${total.toLocaleString()}</span></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))}>
            Back
          </Button>
          {step === 3 && (
            <Button onClick={onConfirm} className="bg-green-600 text-white hover:bg-green-700">
              <Check className="mr-2 size-4" />
              Confirm your luxurious journey
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
