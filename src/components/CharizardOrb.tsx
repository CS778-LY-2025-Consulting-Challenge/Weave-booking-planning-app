'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const ORB_SRC = '/image.png'; // file in /public

export default function CharizardOrb({ size = 'default' }: { size?: 'default' | 'medium' | 'small' }) {
  const dimensions = 
    size === 'small' ? 'h-8 w-8' : 
    size === 'medium' ? 'h-10 w-10' :
    'h-12 w-12 sm:h-14 sm:w-14';
  
  return (
    <motion.div
      className={`relative ${dimensions}`}
      animate={{ y: [0, -3, 0], scale: [1, 1.02, 1] }}
      transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Soft outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-orange-400/45 blur-xl"
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Glass frame */}
      <div className="relative h-full w-full overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-slate-900 via-black to-slate-950 shadow-[0_12px_28px_rgba(0,0,0,0.65)]">
        <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-orange-500/70 via-red-500/70 to-purple-500/70" />
        <div className="absolute inset-[6px] rounded-full bg-[#06030b]" />

        <div className="absolute inset-[6px] overflow-hidden rounded-full">
          <Image
            src={ORB_SRC}
            alt="Charizard flying"
            fill
            unoptimized
            quality={95}
            className="object-contain object-center scale-110 drop-shadow-[0_0_12px_rgba(255,186,134,0.6)]"
            sizes="56px"
            priority
          />
        </div>

        {/* Highlights */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.5),transparent_55%)] opacity-80" />
        <div className="pointer-events-none absolute inset-x-3 top-2 h-1 rounded-full bg-white/60 blur-[2px] opacity-80" />
      </div>
    </motion.div>
  );
}