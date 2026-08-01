"use client";

import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";

export default function Loading() {
  const letters = "LOADING...".split("");

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl">
      <div className="relative flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-primary/20 blur-[64px] rounded-full h-48 w-48 -translate-x-1/4 -translate-y-1/4" />

        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          <div className="absolute inset-0 border-[3px] loader-ring-1 rounded-lg animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-2 border-[3px] loader-ring-2 rounded-lg animate-[spin_4s_linear_infinite_reverse]" />
          <div className="relative z-10 text-primary animate-[spin_2s_linear_infinite]">
            <Hexagon size={44} strokeWidth={2.5} className="fill-primary/20" />
          </div>
        </div>

        <div className="flex gap-1 text-primary font-bold tracking-[0.2em] text-sm">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}
