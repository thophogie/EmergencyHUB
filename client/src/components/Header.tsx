import React, { useState, useEffect } from "react";
import { format } from "date-fns";

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col w-full z-10">
      {/* Main Header */}
      <div className="bg-brand-blue pt-4 pb-2 px-4 flex flex-col items-center justify-center text-white relative shadow-md">
        {/* Logos would go here - using placeholders */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-brand-yellow flex items-center justify-center overflow-hidden">
            {/* Placeholder for Left Logo */}
             <span className="text-xs font-bold text-brand-yellow">LOGO</span>
          </div>
          
          <div className="flex flex-col items-center">
            <h1 className="font-display font-bold text-3xl tracking-tight text-brand-yellow drop-shadow-md uppercase text-center leading-none">
              MDRRMO PIO DURAN
            </h1>
            <div className="flex items-center gap-2 mt-1 w-full justify-between">
              <span className="font-display text-xl text-brand-yellow tracking-wider uppercase">DISASTER HUB</span>
              <span className="font-mono text-sm text-white bg-white/10 px-2 py-0.5 rounded">
                {format(currentTime, "hh:mm a")} | {format(currentTime, "MM/dd/yyyy")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Strip */}
      <div className="bg-brand-yellow py-1.5 w-full overflow-hidden border-y-2 border-brand-blue/20 shadow-sm z-20">
        <div className="marquee-container w-full">
          <div className="marquee-content inline-block whitespace-nowrap">
            <span className="text-brand-blue font-bold text-sm px-4">
              Tomorrow in Pio Duran City, expect partly cloudy weather with a chance of isolated rain showers. Stay safe and prepared! • MDRRMO Hotline: 0912-345-6789 • Stay tuned for further updates.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
