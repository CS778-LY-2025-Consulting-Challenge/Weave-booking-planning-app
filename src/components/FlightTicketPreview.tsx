import { motion } from 'motion/react';
import { Plane } from 'lucide-react';

interface FlightTicketPreviewProps {
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  airline: string;
  cabin: string;
  passengers: number;
  date: Date | null;
  flightNumber?: string;
  gate?: string;
  seats?: string;
}

export function FlightTicketPreview({
  from,
  fromCode,
  to,
  toCode,
  airline,
  cabin,
  passengers,
  date,
  flightNumber = '948264846',
  gate = '77 B',
  seats = '17 B - 25 B',
}: FlightTicketPreviewProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return '-- --- ----';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getCabinBadgeColor = (cabin: string) => {
    if (cabin.toLowerCase().includes('business')) return 'bg-purple-600';
    if (cabin.toLowerCase().includes('first')) return 'bg-amber-600';
    if (cabin.toLowerCase().includes('premium')) return 'bg-blue-600';
    return 'bg-orange-500';
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Starry Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-black rounded-3xl overflow-hidden h-40">
        {/* Stars */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Flight Path */}
      <div className="relative z-10 p-4 h-40">
        {/* Departure City */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="absolute left-4 top-8"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
            <div className="text-white">
              <div className="text-xl font-bold">{fromCode}</div>
              <div className="text-xs opacity-80">{from.split('(')[0].trim()}</div>
            </div>
          </div>
        </motion.div>

        {/* Arrival City */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="absolute right-4 top-12"
        >
          <div className="flex items-center gap-2 flex-row-reverse">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
            <div className="text-white text-right">
              <div className="text-xl font-bold">{toCode}</div>
              <div className="text-xs opacity-80">{to.split('(')[0].trim()}</div>
            </div>
          </div>
        </motion.div>

        {/* Dotted Flight Path */}
        <svg className="absolute left-8 top-12 w-64 h-24" viewBox="0 0 300 100">
          <motion.path
            d="M 10 80 Q 150 -20, 280 40"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </svg>

        {/* Animated Plane */}
        <motion.div
          initial={{ offsetDistance: '0%', opacity: 0 }}
          animate={{ offsetDistance: '100%', opacity: 1 }}
          transition={{ 
            duration: 2,
            delay: 0.5,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            offsetPath: 'path("M 60 130 Q 190 40, 330 100")',
          }}
        >
          <Plane className="w-5 h-5 text-orange-500 -rotate-45" fill="currentColor" />
        </motion.div>
      </div>

      {/* Ticket Card */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-20 mt-28"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
          {/* Ticket Header */}
          <div className="p-5 pb-3">
            <div className="flex items-center justify-between mb-4">
              <span className={`${getCabinBadgeColor(cabin)} text-white px-3 py-1 rounded-lg text-xs font-medium`}>
                {cabin}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{fromCode}</span>
                <Plane className="w-3 h-3 text-gray-400 rotate-90" />
                <span className="font-bold text-gray-900">{toCode}</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {passengers} Flight Ticket{passengers > 1 ? 's' : ''}
            </h3>

            {/* Ticket Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Passenger</div>
                <div className="text-sm font-medium text-gray-900">Guest Traveler</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Date</div>
                <div className="text-sm font-medium text-gray-900">{formatDate(date)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Flight</div>
                <div className="text-sm font-medium text-gray-900">{flightNumber}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Gate</div>
                <div className="text-sm font-medium text-gray-900">{gate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Class</div>
                <div className="text-sm font-medium text-gray-900">{cabin}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Seats</div>
                <div className="text-sm font-medium text-gray-900">{seats}</div>
              </div>
            </div>
          </div>

          {/* Perforated Edge */}
          <div className="relative h-4 flex items-center">
            <div className="absolute inset-0 border-t-2 border-dashed border-gray-300" />
            <div className="absolute -left-2 w-4 h-4 bg-gray-50 rounded-full" />
            <div className="absolute -right-2 w-4 h-4 bg-gray-50 rounded-full" />
          </div>

          {/* Barcode Section */}
          <div className="p-5 pt-3 bg-white">
            <div className="flex justify-center">
              <svg width="250" height="50" viewBox="0 0 300 60">
                {/* Generate barcode-like pattern */}
                {[...Array(50)].map((_, i) => {
                  const width = Math.random() > 0.5 ? 2 : 4;
                  const height = 50;
                  return (
                    <rect
                      key={i}
                      x={i * 6}
                      y={5}
                      width={width}
                      height={height}
                      fill="black"
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}