import { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface PassengerSelectorProps {
  value: PassengerCounts;
  onChange: (value: PassengerCounts) => void;
}

export function PassengerSelector({ value, onChange }: PassengerSelectorProps) {
  const [open, setOpen] = useState(false);

  const totalPassengers = value.adults + value.children + value.infants;

  const increment = (type: keyof PassengerCounts) => {
    const maxPassengers = 9;
    if (totalPassengers >= maxPassengers) return;
    
    onChange({ ...value, [type]: value[type] + 1 });
  };

  const decrement = (type: keyof PassengerCounts) => {
    if (type === 'adults' && value.adults <= 1) return;
    if (value[type] <= 0) return;
    
    onChange({ ...value, [type]: value[type] - 1 });
  };

  const getDisplayText = () => {
    const parts: string[] = [];
    if (value.adults > 0) parts.push(`${value.adults} Adult${value.adults > 1 ? 's' : ''}`);
    if (value.children > 0) parts.push(`${value.children} Child${value.children > 1 ? 'ren' : ''}`);
    if (value.infants > 0) parts.push(`${value.infants} Infant${value.infants > 1 ? 's' : ''}`);
    
    if (parts.length === 1) return parts[0];
    return `${totalPassengers} Passenger${totalPassengers > 1 ? 's' : ''}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full h-14 px-4 py-3 bg-white border border-gray-200 rounded-lg text-left hover:border-gray-300 transition-colors flex items-center justify-between group"
        >
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Passengers</div>
            <div className="text-sm font-medium text-gray-900">{getDisplayText()}</div>
          </div>
          <ChevronDown className={`size-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Passengers</h4>
          
          <div className="space-y-4">
            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{value.adults} Adult</div>
                <div className="text-xs text-gray-500">Ages 12+</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => decrement('adults')}
                  disabled={value.adults <= 1}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="size-4" />
                </button>
                <motion.span
                  key={`adults-${value.adults}`}
                  initial={{ scale: 1.2, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-6 text-center font-medium"
                >
                  {value.adults}
                </motion.span>
                <button
                  type="button"
                  onClick={() => increment('adults')}
                  disabled={totalPassengers >= 9}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{value.children} Child</div>
                <div className="text-xs text-gray-500">Ages 2-11</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => decrement('children')}
                  disabled={value.children <= 0}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="size-4" />
                </button>
                <motion.span
                  key={`children-${value.children}`}
                  initial={{ scale: 1.2, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-6 text-center font-medium"
                >
                  {value.children}
                </motion.span>
                <button
                  type="button"
                  onClick={() => increment('children')}
                  disabled={totalPassengers >= 9}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            {/* Infants */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{value.infants} Infant</div>
                <div className="text-xs text-gray-500">Ages under 2, on lap</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => decrement('infants')}
                  disabled={value.infants <= 0}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="size-4" />
                </button>
                <motion.span
                  key={`infants-${value.infants}`}
                  initial={{ scale: 1.2, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-6 text-center font-medium"
                >
                  {value.infants}
                </motion.span>
                <button
                  type="button"
                  onClick={() => increment('infants')}
                  disabled={totalPassengers >= 9}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500">
              Please note: You can book for a maximum of nine passengers.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
