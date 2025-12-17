import { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface DatePrice {
  date: Date;
  price: number;
  isLowest?: boolean;
  isHighest?: boolean;
}

interface FlightCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  label: string;
}

export function FlightCalendar({ selectedDate, onDateSelect, label }: FlightCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Generate mock prices for dates (in real app, this would come from API)
  const generatePriceForDate = (date: Date): number => {
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    
    // Weekend flights are more expensive
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1;
    
    // Use day number to generate consistent pseudo-random prices
    const basePrice = 600 + (day * 17) % 400;
    return Math.round(basePrice * weekendMultiplier);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (DatePrice | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month with prices
    const prices: number[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const price = generatePriceForDate(date);
      prices.push(price);
      days.push({ date, price });
    }

    // Mark lowest and highest prices
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    days.forEach(day => {
      if (day && day.price === minPrice) day.isLowest = true;
      if (day && day.price === maxPrice) day.isHighest = true;
    });

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="size-4" />
          </Button>
          
          <motion.h3
            key={monthName}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-semibold"
          >
            {monthName}
          </motion.h3>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          <AnimatePresence mode="popLayout">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} />;
              }

              const { date, price, isLowest, isHighest } = day;
              const isSelected = isDateSelected(date);
              const isPast = isDateInPast(date);
              const isHovered = hoveredDate?.toDateString() === date.toDateString();

              return (
                <motion.button
                  key={date.toISOString()}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: isPast ? 1 : 1.05 }}
                  whileTap={{ scale: isPast ? 1 : 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  onClick={() => !isPast && onDateSelect(date)}
                  onMouseEnter={() => !isPast && setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  disabled={isPast}
                  className={`
                    relative p-2 rounded-lg text-center transition-all
                    ${isPast 
                      ? 'cursor-not-allowed opacity-40 bg-gray-50' 
                      : 'cursor-pointer hover:shadow-md'
                    }
                    ${isSelected 
                      ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300' 
                      : 'bg-gray-50 hover:bg-gray-100'
                    }
                    ${isLowest && !isPast && !isSelected 
                      ? 'bg-green-50 border border-green-300' 
                      : ''
                    }
                    ${isHighest && !isPast && !isSelected 
                      ? 'bg-red-50 border border-red-300' 
                      : ''
                    }
                  `}
                >
                  {/* Date Number */}
                  <div className={`text-sm font-semibold mb-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </div>

                  {/* Price */}
                  {!isPast && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}
                    >
                      ${price}
                    </motion.div>
                  )}

                  {/* Price Indicator Badge */}
                  {!isPast && isLowest && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1"
                    >
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <TrendingDown className="size-2.5" />
                      </div>
                    </motion.div>
                  )}

                  {!isPast && isHighest && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1"
                    >
                      <div className="bg-red-500 text-white rounded-full p-1">
                        <TrendingUp className="size-2.5" />
                      </div>
                    </motion.div>
                  )}

                  {/* Hover Tooltip */}
                  <AnimatePresence>
                    {isHovered && !isSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap z-10 shadow-lg"
                      >
                        <div className="font-semibold">${price}</div>
                        <div className="text-gray-300 text-[10px]">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
              <TrendingDown className="size-2 text-white" />
            </div>
            <span className="text-gray-600">Lowest Price</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center">
              <TrendingUp className="size-2 text-white" />
            </div>
            <span className="text-gray-600">Highest Price</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-600" />
            <span className="text-gray-600">Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
