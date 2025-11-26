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
      <div className="bg-brand-blue pt-2 pb-1 px-4 flex flex-col items-center justify-center text-white relative shadow-md">
        {/* Logos would go here - using placeholders */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-14 h-14 rounded-full bg-yellow-500 border-2 border-brand-yellow flex items-center justify-center overflow-hidden">
            <img 
              src="/mdrrmopioduran_160px.png" 
              alt="mdrrmo" 
              className="w-full h-full object-cover" 
            />
          </div>

          
          <div className="flex flex-col items-center">
            <h1 className="font-display font-bold text-3xl tracking-tight text-brand-yellow drop-shadow-md uppercase text-center leading-none">
              MDRRMO PIO DURAN
            </h1>
            <div className="flex items-center">
              <span className="font-display text-xl text-brand-yellow tracking-wider uppercase">DISASTER HUB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Strip */}
      <div className="bg-brand-yellow py-1.5 w-full overflow-hidden border-brand-blue/20 shadow-sm z-20">
        <div className="marquee-container w-full">
          <div className="marquee-content inline-block whitespace-nowrap">
            <span className="text-brand-blue font-bold text-sm px-4">
              Tomorrow in Pio Duran City, expect partly cloudy weather with a chance of isolated rain showers. Stay safe and prepared! • MDRRMO Hotline: 0912-345-6789 • Stay tuned for further updates.
            </span>
          </div>
        </div>
      </div>

      {/* Heavy Rainfall Alert Notification */}
      <div className="items-center bg-red-600 text-white font-bold text-sm py-2 px-4 w-full shadow-md z-30 flex  gap-2">
        <span>⚠️ Heavy Rainfall Alert: Stay indoors.</span>
      </div>
    </div>
  );
}
