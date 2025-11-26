import { useLocation } from "wouter";
import { ArrowLeft, FileText, Download, Search, Clock, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PublicDocuments() {
  const [, setLocation] = useLocation();

  const docs = [
    { title: "MDRRMO Annual Budget 2025", size: "2.4 MB", date: "Nov 20, 2024", type: "pdf" },
    { title: "Disaster Risk Reduction Plan", size: "5.1 MB", date: "Oct 15, 2024", type: "pdf" },
    { title: "Evacuation Center Guidelines", size: "1.2 MB", date: "Sep 01, 2024", type: "doc" },
    { title: "Executive Order No. 24-05", size: "800 KB", date: "Aug 12, 2024", type: "pdf" },
    { title: "Community Drill Report", size: "3.5 MB", date: "Jul 20, 2024", type: "xls" },
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf": return <FileText className="text-red-500" size={24} />;
      case "doc": return <FileText className="text-blue-500" size={24} />;
      case "xls": return <FileText className="text-green-500" size={24} />;
      default: return <FileText className="text-gray-500" size={24} />;
    }
  };

  const getFileBgColor = (type) => {
    switch (type) {
      case "pdf": return "bg-red-50";
      case "doc": return "bg-blue-50";
      case "xls": return "bg-green-50";
      default: return "bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col max-w-md mx-auto shadow-2xl relative">
      {/* Animated Header */}
      <motion.header 
        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 sticky top-0 z-20 shadow-lg flex items-center gap-3"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.button 
          onClick={() => setLocation("/")} 
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={24} />
        </motion.button>
        <motion.h1 
          className="font-display font-bold text-xl tracking-wide uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Public Documents
        </motion.h1>
      </motion.header>

      {/* Search Section */}
      <motion.div 
        className="p-4 bg-white shadow-sm sticky top-[72px] z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="w-full bg-gradient-to-r from-slate-100 to-blue-50 border-none rounded-2xl py-3 pl-10 pr-4 text-slate-700 focus:ring-2 focus:ring-blue-300 shadow-inner"
          />
        </div>
      </motion.div>

      {/* Document List */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        <motion.div 
          className="flex items-center gap-2 text-slate-500 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Clock size={16} />
          <span className="text-sm font-medium">Recently Added</span>
        </motion.div>

        <AnimatePresence>
          {docs.map((doc, idx) => (
            <motion.div 
              key={idx}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md flex items-center justify-between group hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start gap-4">
                <motion.div 
                  className={`p-3 rounded-xl ${getFileBgColor(doc.type)} mt-1`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {getFileIcon(doc.type)}
                </motion.div>
                <div>
                  <motion.h3 
                    className="font-bold text-slate-800 text-base line-clamp-2 group-hover:text-blue-600 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    {doc.title}
                  </motion.h3>
                  <div className="flex gap-3 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <File size={12} />
                      {doc.size}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {doc.date}
                    </span>
                  </div>
                </div>
              </div>
              <motion.button 
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <Download size={20} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      <motion.div 
        className="absolute bottom-6 right-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      >
        <motion.button 
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-lg"
          whileHover={{ scale: 1.1, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
          whileTap={{ scale: 0.9 }}
        >
          <FileText size={24} />
        </motion.button>
      </motion.div>
    </div>
  );
}