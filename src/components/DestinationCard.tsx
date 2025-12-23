import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface DestinationCardProps extends React.HTMLAttributes<HTMLDivElement> {
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

const DestinationCard = React.forwardRef<HTMLDivElement, DestinationCardProps>(
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
    return (
      <div
        ref={ref}
        style={{
          // @ts-ignore - CSS custom properties are valid
          "--theme-color": themeColor,
        } as React.CSSProperties}
        className={cn("group w-full h-full", className)}
        {...props}
      >
        <a
          href={href}
          className="relative block w-full h-full rounded-2xl overflow-hidden shadow-lg 
                     transition-all duration-500 ease-in-out 
                     group-hover:scale-105 group-hover:shadow-[0_0_60px_-15px_hsl(var(--theme-color)/0.6)]"
          aria-label={`Explore details for ${location}`}
          style={{
            boxShadow: `0 0 40px -15px hsl(var(--theme-color) / 0.5)`,
          }}
        >
          {/* Background Image with Parallax Zoom */}
          <div
            className="absolute inset-0 bg-cover bg-center 
                       transition-transform duration-500 ease-in-out group-hover:scale-110"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />

          {/* Themed Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, hsl(var(--theme-color) / 0.4), hsl(var(--theme-color) / 0.15) 40%, transparent 70%)`,
            }}
          />

          {/* Content */}
          <div className="relative flex h-full flex-col items-center justify-center gap-1 p-6 text-center text-white">
            {/* Stats */}
            {days && nights && (
              <p className="mb-2 text-xs font-medium tracking-wide text-white/80">
                {days} DAYS / {nights} NIGHTS
              </p>
            )}

            {/* Location */}
            <h3 className="mb-2 text-2xl font-bold leading-tight tracking-tight whitespace-normal break-words md:text-3xl md:leading-snug">
              {location}
            </h3>

            {/* Description */}
            <p className="mb-4 text-sm font-medium text-white/80 line-clamp-2">{stats}</p>

            {/* Price */}
            {price && (
              <p className="mb-6 text-sm font-semibold text-white/90">
                FROM <span className="text-lg font-bold">${price.toLocaleString()}</span> <span className="text-xs">per person</span>
              </p>
            )}

            {/* Minimal CTA row to avoid boxy overlays */}
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
              <span className="underline underline-offset-4 decoration-[hsl(var(--theme-color))]">
                Explore
              </span>
              <ArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </a>
      </div>
    );
  }
);

DestinationCard.displayName = "DestinationCard";

export { DestinationCard };
