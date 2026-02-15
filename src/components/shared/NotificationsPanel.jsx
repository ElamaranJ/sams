import React, { useState, useEffect } from 'react';
import { 
  Bell, X, CheckCircle, Info, Award, 
  FileText, Clock, Trash2, Users, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NotificationsPanel = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  // Role-specific notifications
  const getNotificationsByRole = () => {
    switch(user?.role) {
      case 'student':
        return [
          {
            id: 1,
            icon: 'FileText',
            color: 'blue',
            title: 'New Assignment Posted',
            message: 'Database Design Project is now available',
            time: '5 min ago',
            read: false
          },
          {
            id: 2,
            icon: 'Award',
            color: 'green',
            title: 'Grade Published',
            message: 'Your Web Development Quiz has been graded: A-',
            time: '1 hour ago',
            read: false
          },
          {
            id: 3,
            icon: 'Clock',
            color: 'orange',
            title: 'Upcoming Deadline',
            message: 'Math Assignment due in 2 days',
            time: '3 hours ago',
            read: false
          },
          {
            id: 4,
            icon: 'Info',
            color: 'purple',
            title: 'Class Rescheduled',
            message: 'CS 101 moved to Lab Room B tomorrow',
            time: '1 day ago',
            read: true
          },
          {
            id: 5,
            icon: 'CheckCircle',
            color: 'green',
            title: 'Attendance Marked',
            message: 'Your attendance for today has been recorded',
            time: '2 days ago',
            read: true
          }
        ];
      
      case 'faculty':
        return [
          {
            id: 1,
            icon: 'FileText',
            color: 'orange',
            title: 'Pending Evaluations',
            message: '24 assignments waiting for grading in CS 101',
            time: '10 min ago',
            read: false
          },
          {
            id: 2,
            icon: 'Users',
            color: 'blue',
            title: 'New Student Enrolled',
            message: 'John Smith enrolled in Database Systems course',
            time: '2 hours ago',
            read: false
          },
          {
            id: 3,
            icon: 'AlertCircle',
            color: 'red',
            title: 'Low Attendance Alert',
            message: '5 students below 75% attendance in Web Development',
            time: '4 hours ago',
            read: false
          },
          {
            id: 4,
            icon: 'Clock',
            color: 'purple',
            title: 'Grading Deadline',
            message: 'Mid-term exams grading due in 3 days',
            time: '1 day ago',
            read: true
          },
          {
            id: 5,
            icon: 'CheckCircle',
            color: 'green',
            title: 'Assignment Submitted',
            message: '42 students submitted Database Design Project',
            time: '2 days ago',
            read: true
          }
        ];
      
      case 'admin':
        return [
          {
            id: 1,
            icon: 'Users',
            color: 'blue',
            title: 'New Faculty Registration',
            message: 'Dr. Robert Chen registered, pending verification',
            time: '15 min ago',
            read: false
          },
          {
            id: 2,
            icon: 'AlertCircle',
            color: 'red',
            title: 'System Maintenance',
            message: 'Scheduled maintenance on Feb 20, 2026 at 2:00 AM',
            time: '1 hour ago',
            read: false
          },
          {
            id: 3,
            icon: 'FileText',
            color: 'orange',
            title: 'Course Approval Request',
            message: '3 new courses waiting for approval',
            time: '5 hours ago',
            read: false
          },
          {
            id: 4,
            icon: 'CheckCircle',
            color: 'green',
            title: 'Backup Completed',
            message: 'System backup successfully completed',
            time: '1 day ago',
            read: true
          },
          {
            id: 5,
            icon: 'Info',
            color: 'purple',
            title: 'Monthly Report Ready',
            message: 'January 2026 system report is available',
            time: '2 days ago',
            read: true
          }
        ];
      
      default:
        return [];
    }
  };

  const [notifications, setNotifications] = useState(getNotificationsByRole());

  const unreadCount = notifications.filter(n => !n.read).length;

  // Update notifications when user role changes
  useEffect(() => {
    setNotifications(getNotificationsByRole());
  }, [user?.role]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'FileText': return <FileText size={20} />;
      case 'Award': return <Award size={20} />;
      case 'Clock': return <Clock size={20} />;
      case 'Info': return <Info size={20} />;
      case 'CheckCircle': return <CheckCircle size={20} />;
      case 'Users': return <Users size={20} />;
      case 'AlertCircle': return <AlertCircle size={20} />;
      default: return <Bell size={20} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
      />

      {/* Panel - Full Height */}
      <div
        className="absolute right-0 top-0 h-screen w-full sm:w-[420px] bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-b-2 border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Bell size={24} className="text-blue-600" />
                Notifications
              </h3>
              {unreadCount > 0 && (
                <p className="text-sm text-slate-600 mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors border-2 border-slate-200"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* Mark all as read - Fixed */}
        {unreadCount > 0 && (
          <div className="flex-shrink-0 px-6 py-3 border-b-2 border-slate-100 bg-slate-50">
            <button
              onClick={markAllAsRead}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <CheckCircle size={16} />
              Mark all as read
            </button>
          </div>
        )}

        {/* Scrollable Notifications List - Takes remaining space */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{ 
            minHeight: 0,
            maxHeight: '100%'
          }}
        >
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Bell size={32} className="text-slate-400" />
              </div>
              <p className="text-lg font-bold text-slate-900 mb-2">All caught up!</p>
              <p className="text-sm text-slate-600">No new notifications</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer group hover:shadow-md ${
                    notif.read
                      ? 'bg-white border-slate-200'
                      : 'bg-blue-50 border-blue-300'
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      notif.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      notif.color === 'green' ? 'bg-green-100 text-green-600' :
                      notif.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                      notif.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      notif.color === 'red' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getIcon(notif.icon)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                          {notif.time}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-t-2 border-slate-100 bg-slate-50">
          <button 
            onClick={() => alert('View All Notifications - This will link to a full notifications page')}
            className="w-full py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            View All Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;