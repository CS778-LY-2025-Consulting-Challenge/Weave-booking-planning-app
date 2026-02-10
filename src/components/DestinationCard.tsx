import * as React from "react";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface DestinationCardProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  imageUrl: string;
  location: string;
  flag: string;
  stats: string;
  href: string;
  themeColor: string;
  price?: number;
  days?: number;
  nights?: number;
}

const DestinationCard = React.forwardRef<HTMLAnchorElement, DestinationCardProps>(
  ({
    className,
    imageUrl,
    location,
    flag,
    stats,
    href,
    themeColor,
    price,
    days,
    nights,
    ...props
  }, ref) => {
    const [isFavorite, setIsFavorite] = React.useState(false);

    return (
      <a
        ref={ref as any}
        href={href}
        className={cn("group block w-full h-full", className)}
        {...props}
      >
        <div className="w-[400px] bg-white rounded-[44px] shadow-lg flex flex-col h-[560px] relative p-[22px] pb-[26px] transition-[transform,box-shadow] duration-[450ms] [transition-timing-function:cubic-bezier(.2,.8,.2,1)] hover:-translate-y-3 hover:scale-[1.015] hover:shadow-[0_40px_80px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,0.6)] border border-transparent">
          {/* Glowing effect */}
          <GlowingEffect
            spread={60}
            glow={true}
            disabled={false}
            proximity={150}
            inactiveZone={0.01}
            borderWidth={2}
            variant="default"
            blur={0}
            className="rounded-[44px]"
          />

          {/* Subtle inner frame */}
          <div className="absolute inset-[14px] rounded-[34px] border-2 border-[rgba(210,215,222,0.55)] pointer-events-none z-20" />

          {/* Hero Image */}
          <div className="h-[290px] rounded-[36px] overflow-hidden bg-gray-300 flex-shrink-0 relative z-10">
            <img
              src={imageUrl}
              alt={location}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="pt-[18px] relative z-10 flex-1 flex flex-col px-[6px]">
            {/* Title */}
            <h3 className="text-[34px] font-black leading-none tracking-tight text-gray-900 mb-[6px]">
              {location}
            </h3>

            {/* Subtitle */}
            <p className="text-base text-gray-500 font-medium mb-4">
              {stats}
            </p>

            {/* Meta info */}
            <div className="flex items-center gap-[18px] mb-[18px] text-gray-700 font-semibold text-sm">
              {price && (
                <div className="flex items-center gap-2">
                  <svg className="w-[18px] h-[18px] opacity-55" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.59 13.41 12 22l-9-9V2h11l6.59 6.59c.78.78.78 2.05 0 2.82ZM7.5 7A1.5 1.5 0 1 0 6 5.5 1.5 1.5 0 0 0 7.5 7Z" />
                  </svg>
                  <span>from ${price.toLocaleString()}</span>
                </div>
              )}
              {days && nights && (
                <div className="flex items-center gap-2">
                  <svg className="w-[18px] h-[18px] opacity-55" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5Z" />
                  </svg>
                  <span>{days}d {nights}n</span>
                </div>
              )}
            </div>

            {/* Action buttons - flex-grow to push to bottom */}
            <div className="flex items-center gap-[14px] mt-auto">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // Navigate to details page
                  window.location.href = href;
                }}
                className="flex-1 h-[58px] bg-black text-white font-bold text-base rounded-full hover:bg-gray-800 transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                Explore
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsFavorite(!isFavorite);
                }}
                className="w-[58px] h-[58px] rounded-full bg-white border-2 border-[rgba(210,215,222,0.7)] flex items-center justify-center hover:bg-gray-50 transition-colors duration-300 shadow-md hover:shadow-lg flex-shrink-0"
                aria-label="Save"
              >
                <svg
                  className={`w-[22px] h-[22px] transition-colors duration-300 ${isFavorite ? "fill-red-500 stroke-red-500" : "fill-none stroke-red-500"
                    }`}
                  strokeWidth={2.2}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21s-7.2-4.6-9.6-8.7C.7 9.2 2.2 5.9 5.6 5.2c1.8-.4 3.5.4 4.6 1.7 1.1-1.3 2.8-2.1 4.6-1.7 3.4.7 4.9 4 3.2 7.1C19.2 16.4 12 21 12 21z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </a>
    );
  }
);

DestinationCard.displayName = "DestinationCard";

export { DestinationCard };
