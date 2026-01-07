/* -----------------------------------------------------------------------------
 * Gallery Background
 * Light grey walls and concrete floor.
 * -------------------------------------------------------------------------- */

export function GalleryWall() {
  return (
    <div className="relative h-full w-full bg-[#d4d4d4]">
      {/* Light Noise Texture */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.03] mix-blend-multiply">
        <filter id="wall-texture">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#wall-texture)" />
      </svg>
    </div>
  );
}

export function GalleryFloor() {
  return (
    <div className="absolute bottom-0 h-32 w-full border-t border-black/5 bg-[#f0f0f0]">
      {/* Concrete Texture */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04] mix-blend-multiply">
        <filter id="floor-texture">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#floor-texture)" />
      </svg>

      {/* Floor Grained Details */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.1]">
        <defs>
          <pattern
            id="floor-grain"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="30" r="0.5" fill="#000" />
            <circle cx="150" cy="80" r="0.8" fill="#000" />
            <circle cx="80" cy="160" r="0.4" fill="#000" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#floor-grain)" />
      </svg>

      {/* Ambient Floor Glow & Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-transparent" />
    </div>
  );
}
