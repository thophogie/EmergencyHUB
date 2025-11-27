import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col w-full sticky top-0 z-50">
      {/* Main Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 pt-3 pb-2 px-4 flex flex-col items-center justify-center text-white relative shadow-xl">
        {/* Logos and Title */}
        <div className="flex items-center gap-4 mb-2 relative z-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 border-2 border-yellow-300 flex items-center justify-center overflow-hidden shadow-lg">
            <img
              src="/mdrrmopioduran_160px.png"
              alt="mdrrmo"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col items-center">
            <h1 className="font-display font-extrabold text-3xl tracking-tight text-yellow-300 drop-shadow-lg uppercase text-center leading-none">
              MDRRMO PIO DURAN
            </h1>
            <div className="flex items-center mt-1">
              <span className="font-display text-xl text-yellow-400 tracking-wider uppercase font-bold">
                EMERGENCY HUB
              </span>
            </div>
          </div>
        </div>

        {/* Time Display */}
        <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/20 shadow-inner">
          <div className="text-yellow-200 font-mono text-sm font-medium">
            {format(currentTime, "MMMM d, yyyy • h:mm:ss a")}
          </div>
        </div>
      </div>

      {/* Animated Marquee Strip */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 py-2 w-full overflow-hidden relative z-20 shadow-lg">
        <div className="marquee-container w-full relative">
          <div className="marquee-content inline-block whitespace-nowrap">
            <span className="text-blue-950 font-extrabold text-sm px-4 flex items-center">
              <span className="mr-2">🚨</span>
              Tomorrow in Pio Duran City, expect partly cloudy weather with a
              chance of isolated rain showers. Stay safe and prepared!
              <span className="mx-4">📞</span>
              MDRRMO Hotline: 0917-772-5016
              <span className="mx-4">📡</span>
              Stay tuned for further updates.
              <span className="mx-4">🚨</span>
            </span>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Accent */}
      <div className="h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
    </div>
  );
}
