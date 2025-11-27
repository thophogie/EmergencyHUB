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
      transition={{ delay: index * 0.08, duration: 0.3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 shadow-[0_6px_0_0_rgba(59,130,246,0.5)] active:shadow-none active:translate-y-[6px] transition-all border-2 border-yellow-500 min-h-[140px] w-full cursor-pointer relative overflow-hidden touch-manipulation"
    >
      <div className="text-blue-950 mb-2">
        {icon}
      </div>
      <span className="text-blue-950 font-bold text-sm text-center leading-tight font-sans z-10">
        {label}
      </span>

      {/* Decorative corner element */}
      <div className="absolute bottom-2 right-2 w-5 h-5 border-r-2 border-b-2 border-yellow-400 rounded-br-lg"></div>
    </motion.button>
  );
}