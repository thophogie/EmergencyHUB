import { Home, Mail, User, PhoneCall } from "lucide-react";

export function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Emergency Button - Floating above */}
      <div className="absolute -top-6 left-0 right-0 flex justify-center px-4">
        <button className="bg-brand-red hover:bg-brand-red-hover text-white w-full max-w-md py-3 rounded-full shadow-lg flex items-center justify-center gap-2 border-2 border-white active:scale-95 transition-transform animate-pulse">
          <PhoneCall size={24} fill="white" />
          <span className="font-bold text-lg uppercase tracking-wide">Emergency Hotlines!</span>
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="bg-brand-yellow h-20 flex items-end justify-around pb-4 pt-8 px-6 rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.2)]">
        <button className="flex flex-col items-center gap-1 text-brand-blue hover:text-white transition-colors">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <Home size={24} className="text-brand-blue" />
          </div>
        </button>
        
        <button className="flex flex-col items-center gap-1 text-brand-blue hover:text-white transition-colors">
           <div className="bg-brand-blue p-2 rounded-full shadow-sm">
            <Mail size={24} className="text-white" />
          </div>
        </button>

        <button className="flex flex-col items-center gap-1 text-brand-blue hover:text-white transition-colors">
           <div className="bg-white p-2 rounded-full shadow-sm">
            <User size={24} className="text-brand-blue" />
          </div>
        </button>
      </div>
    </div>
  );
}
