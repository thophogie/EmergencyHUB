import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { PhoneCall } from "lucide-react";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { HotlineDrawerContent } from "@/components/HotlineDrawerContent";

const API_KEY = "bb0b8b639634c8a7a6c9faee7dca96e5";
const LAT = 13.0293;
const LON = 123.445;

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherAlert, setWeatherAlert] = useState("Stay safe and prepared!");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        
        if (data.weather && data.weather[0]) {
          const temp = Math.round(data.main.temp);
          const description = data.weather[0].description;
          setWeatherAlert(`Current weather in Pio Duran: ${temp}°C, ${description}. Stay safe and prepared!`);
        }
      } catch (error) {
        console.error("Failed to fetch weather:", error);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Update every 10 minutes
    return () => clearInterval(interval);
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
              {weatherAlert}
              <span className="mx-4">📞</span>
              MDRRMO Hotline: 0917-772-5016
              <span className="mx-4">📡</span>
              Stay tuned for further updates.
              <span className="mx-4">🚨</span>
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Hotline Button */}
      <Drawer>
        <div className="px-4 py-3 bg-blue-950">
          <DrawerTrigger asChild>
            <button className="bg-brand-red hover:bg-brand-red-hover text-white w-full py-2.5 rounded-full shadow-lg flex items-center justify-center gap-2 border-2 border-white active:scale-95 transition-transform animate-pulse cursor-pointer touch-manipulation">
              <PhoneCall size={22} fill="white" />
              <span className="font-bold text-base uppercase tracking-wide">
                Emergency Hotlines!
              </span>
            </button>
          </DrawerTrigger>
        </div>
        <HotlineDrawerContent />
      </Drawer>

      {/* Decorative Bottom Accent */}
      <div className="h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
    </div>
  );
}
