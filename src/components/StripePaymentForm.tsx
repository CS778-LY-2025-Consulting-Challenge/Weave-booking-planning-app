'use client';

import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface StripePaymentFormProps {
  totalPrice: number;
  currency: string;
  onPaymentSuccess: (paymentMethodId: string) => void;
  onPaymentError: (error: string) => void;
  isLoading?: boolean;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
    },
  },
};

export function StripePaymentForm({
  totalPrice,
  currency,
  onPaymentSuccess,
  onPaymentError,
  isLoading = false,
  hotelName,
  checkInDate,
  checkOutDate,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [cardholderName, setCardholderName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleCardChange = (event: any) => {
    setCardError(event.error?.message || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setCardError('Stripe is not loaded');
      return;
    }

    if (!cardholderName.trim()) {
      setCardError('Cardholder name is required');
      return;
    }

    if (!billingEmail.trim()) {
      setCardError('Billing email is required');
      return;
    }

    setProcessing(true);
    setCardError(null);

    try {
      // Create PaymentMethod from card details
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: cardholderName,
          email: billingEmail,
        },
      });

      if (error) {
        setCardError(error.message || 'Payment method creation failed');
        toast.error(error.message || 'Payment method creation failed');
        return;
      }

      if (paymentMethod) {
        onPaymentSuccess(paymentMethod.id);
        toast.success('Card details securely saved');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment processing failed';
      setCardError(message);
      onPaymentError(message);
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="border-gray-200">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-bold">Payment Details</h3>
          <p className="text-sm text-gray-600">
            {hotelName} • {checkInDate} to {checkOutDate}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency,
                }).format(totalPrice)}
              </span>
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <Label htmlFor="cardholder-name" className="mb-2 block font-semibold">
              Cardholder Name *
            </Label>
            <Input
              id="cardholder-name"
              type="text"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              disabled={processing || isLoading}
              className="border-gray-300"
              required
            />
          </div>

          {/* Billing Email */}
          <div>
            <Label htmlFor="billing-email" className="mb-2 block font-semibold">
              Billing Email *
            </Label>
            <Input
              id="billing-email"
              type="email"
              placeholder="john@example.com"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              disabled={processing || isLoading}
              className="border-gray-300"
              required
            />
          </div>

          {/* Card Element */}
          <div>
            <Label className="mb-2 block font-semibold">Card Details *</Label>
            <div className="rounded-md border border-gray-300 bg-white p-4">
              <CardElement
                options={CARD_ELEMENT_OPTIONS}
                onChange={handleCardChange}
              />
            </div>
          </div>

          {/* Error Message */}
          {cardError && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-800">{cardError}</p>
            </div>
          )}

          {/* Security Notice */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs text-blue-900">
              🔒 Your payment information is secured with Stripe. We never store full card details on our servers.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={processing || isLoading || !stripe || !elements}
            className="w-full bg-black py-6 text-lg hover:bg-gray-800"
          >
            {processing || isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
              }).format(totalPrice)}`
            )}
          </Button>
        </form>

        {/* Stripe Branding */}
        <div className="mt-6 border-t pt-4 text-center">
          <p className="text-xs text-gray-500">
            Powered by <span className="font-semibold">Stripe</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
