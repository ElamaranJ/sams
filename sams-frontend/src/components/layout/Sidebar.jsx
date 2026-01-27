import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, BookOpen, Calendar, FileText, Award, QrCode, Users, 
  BarChart3, Settings
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const location = useLocation();

  const menuItems = {
    student: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: BookOpen, label: 'My Classes', path: '/classes' },
      { icon: Calendar, label: 'Calendar', path: '/calendar' },
      { icon: FileText, label: 'Assignments', path: '/assignments' },
      { icon: Award, label: 'Grades', path: '/grades' },
      { icon: QrCode, label: 'Attendance', path: '/attendance' },
    ],
    faculty: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: BookOpen, label: 'My Classes', path: '/classes' },
      { icon: Users, label: 'Students', path: '/students' },
      { icon: FileText, label: 'Assignments', path: '/assignments' },
      { icon: QrCode, label: 'Attendance', path: '/attendance' },
      { icon: BarChart3, label: 'Analytics', path: '/reports' },
    ],
    admin: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Users, label: 'Users', path: '/users' },
      { icon: BookOpen, label: 'Courses', path: '/courses' },
      { icon: Calendar, label: 'Schedule', path: '/schedule' },
      { icon: BarChart3, label: 'Reports', path: '/reports' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ],
  };

  const items = menuItems[role] || menuItems.student;

  return (
    <div className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r-2 border-slate-100 overflow-y-auto">
      <div className="p-4 space-y-1">
        {items.map((item, index) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={index}
              to={item.path}
            >
              <motion.div
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats in Sidebar */}
      <div className="p-4 mt-4 border-t-2 border-slate-100">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-100">
          <div className="text-xs font-bold text-slate-500 mb-2">Quick Stats</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Classes Today</span>
              <span className="text-sm font-bold text-slate-900">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Pending</span>
              <span className="text-sm font-bold text-orange-600">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Attendance</span>
              <span className="text-sm font-bold text-green-600">94%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;