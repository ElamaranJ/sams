import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Clock, MapPin, Users, Video, Plus, Filter
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day

  // Sample events data
  const events = [
    {
      id: 1,
      title: 'Computer Science 101',
      type: 'lecture',
      date: new Date(2026, 1, 15, 10, 0),
      duration: 90,
      location: 'Lecture Hall A',
      instructor: 'Dr. Sarah Miller',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Database Systems Lab',
      type: 'lab',
      date: new Date(2026, 1, 15, 14, 0),
      duration: 120,
      location: 'Computer Lab 3',
      instructor: 'Prof. John Smith',
      color: 'purple'
    },
    {
      id: 3,
      title: 'Web Development Workshop',
      type: 'workshop',
      date: new Date(2026, 1, 16, 11, 0),
      duration: 180,
      location: 'Workshop Room',
      instructor: 'Dr. Emily Chen',
      color: 'green'
    },
    {
      id: 4,
      title: 'Math Assignment Due',
      type: 'deadline',
      date: new Date(2026, 1, 18, 23, 59),
      duration: 0,
      color: 'red'
    },
    {
      id: 5,
      title: 'Project Presentation',
      type: 'presentation',
      date: new Date(2026, 1, 20, 15, 0),
      duration: 60,
      location: 'Conference Room',
      color: 'orange'
    }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month days
    const prevMonthDays = startingDayOfWeek;
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 weeks
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' }
    };
    return colors[color] || colors.blue;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const days = getDaysInMonth(currentDate);
  const todayEvents = getEventsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">
                Calendar 📅
              </h1>
              <p className="text-lg text-slate-600">Manage your schedule and events</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" icon={Filter}>
                Filter
              </Button>
              <Button icon={Plus}>
                New Event
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={previousMonth}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft size={20} className="text-slate-700" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <ChevronRight size={20} className="text-slate-700" />
                  </button>
                </div>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center py-2 text-sm font-bold text-slate-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((dayObj, index) => {
                  const dayEvents = getEventsForDate(dayObj.date);
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(dayObj.date)}
                      className={`aspect-square p-2 rounded-xl transition-all relative ${
                        !dayObj.isCurrentMonth
                          ? 'text-slate-300'
                          : isToday(dayObj.date)
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white font-black shadow-lg'
                          : isSelected(dayObj.date)
                          ? 'bg-blue-100 text-blue-600 font-bold border-2 border-blue-300'
                          : 'hover:bg-slate-100 text-slate-700 font-semibold'
                      }`}
                    >
                      <div className="text-sm">{dayObj.day}</div>
                      {hasEvents && dayObj.isCurrentMonth && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isToday(dayObj.date) ? 'bg-white' : `bg-${event.color}-600`
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Events Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4">
                {selectedDate.toDateString() === new Date().toDateString()
                  ? "Today's Schedule"
                  : selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h3>

              {todayEvents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon size={32} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600">No events scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map((event) => {
                    const colors = getColorClasses(event.color);
                    return (
                      <div
                        key={event.id}
                        className={`p-4 rounded-xl border-2 ${colors.bg} ${colors.border}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-bold ${colors.text}`}>
                            {event.title}
                          </h4>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${colors.bg} ${colors.text}`}>
                            {event.type}
                          </span>
                        </div>
                        
                        {event.duration > 0 && (
                          <div className={`flex items-center gap-2 text-sm ${colors.text} mb-1`}>
                            <Clock size={14} />
                            <span>{formatTime(event.date)}</span>
                            <span>({event.duration} min)</span>
                          </div>
                        )}
                        
                        {event.location && (
                          <div className={`flex items-center gap-2 text-sm ${colors.text} mb-1`}>
                            <MapPin size={14} />
                            <span>{event.location}</span>
                          </div>
                        )}
                        
                        {event.instructor && (
                          <div className={`flex items-center gap-2 text-sm ${colors.text}`}>
                            <Users size={14} />
                            <span>{event.instructor}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-xl font-black text-slate-900 mb-4">
                This Week
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Classes</span>
                  <span className="text-2xl font-black text-blue-600">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Assignments Due</span>
                  <span className="text-2xl font-black text-orange-600">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Study Hours</span>
                  <span className="text-2xl font-black text-green-600">24h</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;