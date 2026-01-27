import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell, ChevronRight, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b-2 border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
            <img 
              src="/logo.png"
              alt="SAMS Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/></svg>';
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              SAMS
            </h1>
            <p className="text-xs text-slate-500 font-medium">Academic Management</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <button className="text-slate-700 hover:text-slate-900 font-semibold transition-colors">
            Online Degrees
          </button>
          <button className="text-slate-700 hover:text-slate-900 font-semibold transition-colors">
            Find your New Career
          </button>
          <button className="text-slate-700 hover:text-slate-900 font-semibold transition-colors">
            Blog
          </button>
          <button className="text-slate-700 hover:text-slate-900 font-semibold transition-colors">
            Contact
          </button>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                <Search size={20} className="text-slate-700" />
              </button>
              <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors relative">
                <Bell size={20} className="text-slate-700" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 pl-2 pr-3 py-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl border-2 border-slate-100 shadow-xl overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 border-b-2 border-slate-100">
                      <p className="font-bold text-slate-900">{user?.name}</p>
                      <p className="text-sm text-slate-600">{user?.email}</p>
                      <p className="text-xs text-blue-600 mt-1 font-semibold capitalize">{user?.role}</p>
                    </div>
                    
                    <button className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition-colors">
                      <User size={18} /> Profile
                    </button>
                    
                    <button className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition-colors">
                      <Settings size={18} /> Settings
                    </button>
                    
                    <button 
                      onClick={() => {
                        logout();
                        navigate('/');
                        setShowProfile(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-medium flex items-center gap-3 transition-colors border-t-2 border-slate-100"
                    >
                      <LogOut size={18} /> Sign out
                    </button>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;