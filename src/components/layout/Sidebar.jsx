import React from 'react';
import { Home, FileText } from 'lucide-react';

const Sidebar = ({ role, activePage, setActivePage }) => {
  return (
    <div className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r-2 border-slate-100 overflow-y-auto">
      <div className="p-4 space-y-2">
        <button
          onClick={() => setActivePage('home')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
            activePage === 'home'
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Home size={20} />
          <span>Dashboard</span>
        </button>
        
        <button
          onClick={() => setActivePage('assignments')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
            activePage === 'assignments'
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileText size={20} />
          <span>Assignments</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;