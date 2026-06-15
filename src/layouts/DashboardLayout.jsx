import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { X, Shield } from 'lucide-react';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-dark-950 text-gray-100 font-sans relative">
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary-600/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            {/* Slide-out Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel p-6 flex flex-col md:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-lg border border-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP PERMANENT SIDEBAR */}
      <aside className="hidden md:block w-64 glass-panel border-y-0 border-l-0 p-6 z-30 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 relative z-20 overflow-hidden">
        {/* Top Navbar */}
        <Navbar onMenuOpen={() => setSidebarOpen(true)} />

        {/* Scrollable Router Output Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto relative">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
