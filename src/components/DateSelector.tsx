import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { FlightCalendar } from './FlightCalendar';

interface DateSelectorProps {
  label: string;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export function DateSelector({ label, selectedDate, onDateSelect }: DateSelectorProps) {
  const [open, setOpen] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full h-14 px-4 py-3 bg-white border border-gray-200 rounded-lg text-left hover:border-gray-300 transition-colors"
        >
          <div className="text-xs text-gray-500 mb-0.5">{label}</div>
          <div className="text-sm font-medium text-gray-900">{formatDate(selectedDate)}</div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <FlightCalendar
          selectedDate={selectedDate}
          onDateSelect={(date) => {
            onDateSelect(date);
            setOpen(false);
          }}
          label=""
        />
      </PopoverContent>
    </Popover>
  );
}
