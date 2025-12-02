import { useLocation } from "wouter";
import {
  Megaphone,
  CloudSun,
  Map,
  ShieldAlert,
  Backpack,
  Wrench,
  FileText,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  index: number;
}

function DashboardButton({
  icon,
  label,
  onClick,
  index,
}: DashboardButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 shadow-[0_6px_0_0_rgba(59,130,246,0.5)] active:shadow-none active:translate-y-[6px] transition-all border-2 border-yellow-500 min-h-[140px] w-full cursor-pointer relative overflow-hidden touch-manipulation"
      style={{ touchAction: 'manipulation' } as any}
    >
      <div className="text-blue-950 mb-2">
        {icon}
      </div>
      <span className="text-blue-950 font-bold text-sm text-center leading-tight font-sans z-10">
        {label}
      </span>

      <div className="absolute bottom-2 right-2 w-5 h-5 border-r-2 border-b-2 border-yellow-400 rounded-br-lg"></div>
    </motion.button>
  );
}

export function DashboardGrid() {
  const [, setLocation] = useLocation();

  const buttons = [
    {
      icon: <Megaphone size={40} strokeWidth={1.5} />,
      label: "Report an Incident",
      onClick: () => setLocation("/report-incident"),
    },
    {
      icon: <CloudSun size={40} strokeWidth={1.5} />,
      label: "Weather Hub",
      onClick: () => setLocation("/weather-outlook"),
    },
    {
      icon: <Map size={40} strokeWidth={1.5} />,
      label: "Evacuation Plan",
      onClick: () => setLocation("/evacuation-plan"),
    },
    {
      icon: <ShieldAlert size={40} strokeWidth={1.5} />,
      label: "Emergency Plan",
      onClick: () => setLocation("/disaster-plan"),
    },
    {
      icon: <Backpack size={40} strokeWidth={1.5} />,
      label: "Go Bag",
      onClick: () => setLocation("/go-bag"),
    },
    {
      icon: <Wrench size={40} strokeWidth={1.5} />,
      label: "Emergency Tools",
      onClick: () => setLocation("/emergency-tools"),
    },
    {
      icon: <FileText size={40} strokeWidth={1.5} />,
      label: "Resources",
      onClick: () => setLocation("/public-documents"),
    },
    {
      icon: <GraduationCap size={40} strokeWidth={1.5} />,
      label: "Learning Materials",
      onClick: () => setLocation("/learning-materials"),
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 relative">
      {/* Simplified Background Pattern for better mobile performance */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, yellow 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>


      {/* Main Grid */}
      <div className="px-4 py-4 relative z-10 pb-28">
        <div className="grid grid-cols-2 gap-4">
          {buttons.map((btn, index) => (
            <DashboardButton
              key={index}
              icon={btn.icon}
              label={btn.label}
              onClick={btn.onClick}
              index={index}
            />
          ))}
        </div>
      </div>


    </div>
  );
}
