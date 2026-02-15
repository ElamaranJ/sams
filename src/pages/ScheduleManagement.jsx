import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Plus, Edit, Trash2, Search, Filter,
  Download, Upload, RefreshCw, MapPin, Users, BookOpen,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle,
  Copy, Settings, BarChart3, Eye
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';

const ScheduleManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'
  const [selectedRoom, setSelectedRoom] = useState('all');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', 
    '4:00 PM', '5:00 PM'
  ];

  // Sample schedule data
  const schedules = [
    {
      id: 1,
      course: 'CS 101',
      courseName: 'Intro to Programming',
      instructor: 'Dr. Sarah Miller',
      day: 'Monday',
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      room: 'Lecture Hall A',
      capacity: 50,
      enrolled: 45,
      color: 'from-blue-500 to-blue-600',
      type: 'lecture'
    },
    {
      id: 2,
      course: 'CS 101',
      courseName: 'Intro to Programming',
      instructor: 'Dr. Sarah Miller',
      day: 'Wednesday',
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      room: 'Lecture Hall A',
      capacity: 50,
      enrolled: 45,
      color: 'from-blue-500 to-blue-600',
      type: 'lecture'
    },
    {
      id: 3,
      course: 'CS 101',
      courseName: 'Intro to Programming',
      instructor: 'Dr. Sarah Miller',
      day: 'Friday',
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      room: 'Lecture Hall A',
      capacity: 50,
      enrolled: 45,
      color: 'from-blue-500 to-blue-600',
      type: 'lecture'
    },
    {
      id: 4,
      course: 'MATH 201',
      courseName: 'Discrete Mathematics',
      instructor: 'Prof. John Davis',
      day: 'Tuesday',
      startTime: '2:00 PM',
      endTime: '3:30 PM',
      room: 'Room 204',
      capacity: 40,
      enrolled: 38,
      color: 'from-purple-500 to-purple-600',
      type: 'lecture'
    },
    {
      id: 5,
      course: 'MATH 201',
      courseName: 'Discrete Mathematics',
      instructor: 'Prof. John Davis',
      day: 'Thursday',
      startTime: '2:00 PM',
      endTime: '3:30 PM',
      room: 'Room 204',
      capacity: 40,
      enrolled: 38,
      color: 'from-purple-500 to-purple-600',
      type: 'lecture'
    },
    {
      id: 6,
      course: 'CS 202',
      courseName: 'Data Structures',
      instructor: 'Dr. Emily Chen',
      day: 'Monday',
      startTime: '1:00 PM',
      endTime: '2:30 PM',
      room: 'Lab 3',
      capacity: 45,
      enrolled: 42,
      color: 'from-green-500 to-emerald-600',
      type: 'lab'
    },
    {
      id: 7,
      course: 'CS 202',
      courseName: 'Data Structures',
      instructor: 'Dr. Emily Chen',
      day: 'Wednesday',
      startTime: '1:00 PM',
      endTime: '2:30 PM',
      room: 'Lab 3',
      capacity: 45,
      enrolled: 42,
      color: 'from-green-500 to-emerald-600',
      type: 'lab'
    },
    {
      id: 8,
      course: 'WEB 301',
      courseName: 'Web Development',
      instructor: 'Prof. Michael Brown',
      day: 'Tuesday',
      startTime: '11:00 AM',
      endTime: '12:30 PM',
      room: 'Computer Lab 1',
      capacity: 40,
      enrolled: 35,
      color: 'from-orange-500 to-red-500',
      type: 'lab'
    },
    {
      id: 9,
      course: 'WEB 301',
      courseName: 'Web Development',
      instructor: 'Prof. Michael Brown',
      day: 'Thursday',
      startTime: '11:00 AM',
      endTime: '12:30 PM',
      room: 'Computer Lab 1',
      capacity: 40,
      enrolled: 35,
      color: 'from-orange-500 to-red-500',
      type: 'lab'
    }
  ];

  const rooms = [
    { id: 'all', name: 'All Rooms', count: schedules.length },
    { id: 'lecturehalla', name: 'Lecture Hall A', capacity: 50, type: 'Lecture' },
    { id: 'room204', name: 'Room 204', capacity: 40, type: 'Classroom' },
    { id: 'lab3', name: 'Lab 3', capacity: 45, type: 'Lab' },
    { id: 'computerlab1', name: 'Computer Lab 1', capacity: 40, type: 'Lab' }
  ];

  const stats = {
    totalClasses: schedules.length,
    activeRooms: 4,
    avgUtilization: 87,
    conflicts: 0
  };

  const getScheduleForTimeSlot = (day, time) => {
    return schedules.filter(schedule => {
      if (schedule.day !== day) return false;
      const scheduleTime = schedule.startTime;
      return scheduleTime === time;
    });
  };

  const getUtilizationColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">
                Schedule Management 📅
              </h1>
              <p className="text-lg text-slate-600">Manage class schedules and room allocations</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" icon={RefreshCw}>
                Auto Schedule
              </Button>
              <Button variant="primary" icon={Plus}>
                Add Class
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Classes', value: stats.totalClasses, icon: BookOpen, color: 'from-blue-500 to-blue-600', change: '+5' },
            { label: 'Active Rooms', value: stats.activeRooms, icon: MapPin, color: 'from-green-500 to-emerald-600', change: '+1' },
            { label: 'Room Utilization', value: `${stats.avgUtilization}%`, icon: BarChart3, color: 'from-purple-500 to-purple-600', change: '+3%' },
            { label: 'Schedule Conflicts', value: stats.conflicts, icon: AlertCircle, color: 'from-orange-500 to-red-500', change: '0' }
          ].map((stat, i) => (
            <Card key={i} delay={i * 0.1} className="p-6 bg-gradient-to-br hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon size={24} className="text-white" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  stat.change === '0' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Date Navigation */}
          <Card className="p-4 flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              <span className="font-bold text-slate-900">Week of Feb 15 - Feb 19, 2026</span>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </Card>

          {/* View Mode Toggle */}
          <Card className="p-2 flex gap-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                viewMode === 'week' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                viewMode === 'day' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Day View
            </button>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" icon={Download} size="sm">
              Export
            </Button>
            <Button variant="outline" icon={Upload} size="sm">
              Import
            </Button>
            <Button variant="outline" icon={Settings} size="sm">
              Settings
            </Button>
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <Card className="overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-6 bg-slate-50 border-b-2 border-slate-200">
                <div className="p-4 font-black text-slate-700 border-r border-slate-200">
                  Time
                </div>
                {daysOfWeek.map((day) => (
                  <div key={day} className="p-4 text-center font-black text-slate-700 border-r border-slate-200">
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((time, timeIndex) => (
                <div key={time} className="grid grid-cols-6 border-b border-slate-100">
                  {/* Time Column */}
                  <div className="p-4 bg-slate-50 border-r border-slate-200 font-bold text-slate-600 text-sm">
                    {time}
                  </div>

                  {/* Day Columns */}
                  {daysOfWeek.map((day) => {
                    const classes = getScheduleForTimeSlot(day, time);
                    return (
                      <div 
                        key={`${day}-${time}`} 
                        className="p-2 border-r border-slate-100 min-h-[80px] hover:bg-slate-50 transition-colors relative group"
                      >
                        {classes.length > 0 ? (
                          classes.map((schedule) => (
                            <div
                              key={schedule.id}
                              className={`p-3 rounded-lg bg-gradient-to-br ${schedule.color} shadow-md hover:shadow-lg transition-all cursor-pointer mb-2`}
                            >
                              <div className="font-bold text-white text-sm mb-1">
                                {schedule.course}
                              </div>
                              <div className="text-xs text-white opacity-90 mb-1">
                                {schedule.courseName}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-white opacity-80">
                                <MapPin size={10} />
                                {schedule.room}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-white opacity-80">
                                <Users size={10} />
                                {schedule.enrolled}/{schedule.capacity}
                              </div>
                            </div>
                          ))
                        ) : (
                          <button className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={16} className="text-slate-400" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Room Utilization */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <MapPin size={24} className="text-blue-600" />
              Room Utilization
            </h3>
            <div className="space-y-4">
              {rooms.filter(r => r.id !== 'all').map((room, i) => {
                const roomSchedules = schedules.filter(s => 
                  s.room.toLowerCase().replace(' ', '') === room.id
                );
                const utilization = (roomSchedules.length / timeSlots.length / 5) * 100;
                
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-bold text-slate-900">{room.name}</div>
                        <div className="text-xs text-slate-500">{room.type} • Capacity: {room.capacity}</div>
                      </div>
                      <span className={`text-sm font-black px-3 py-1 rounded-full ${getUtilizationColor(utilization)}`}>
                        {Math.round(utilization)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Clock size={24} className="text-purple-600" />
              Peak Hours
            </h3>
            <div className="space-y-3">
              {[
                { time: '10:00 AM - 11:00 AM', classes: 3, utilization: 75, popular: true },
                { time: '1:00 PM - 2:00 PM', classes: 2, utilization: 50, popular: false },
                { time: '2:00 PM - 3:00 PM', classes: 2, utilization: 50, popular: false },
                { time: '11:00 AM - 12:00 PM', classes: 2, utilization: 50, popular: false }
              ].map((slot, i) => (
                <div key={i} className={`p-4 rounded-xl ${slot.popular ? 'bg-purple-50 border-2 border-purple-200' : 'bg-slate-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-900">{slot.time}</span>
                    {slot.popular && (
                      <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        Peak Hour
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{slot.classes} classes scheduled</span>
                    <span className={`font-bold ${getUtilizationColor(slot.utilization).split(' ')[0]}`}>
                      {slot.utilization}% utilized
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <Copy size={32} className="text-blue-600 mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-2">Duplicate Schedule</h3>
            <p className="text-sm text-slate-600 mb-4">Copy current schedule to next semester</p>
            <Button variant="primary" fullWidth size="sm">
              Duplicate
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CheckCircle size={32} className="text-green-600 mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-2">Check Conflicts</h3>
            <p className="text-sm text-slate-600 mb-4">Validate schedule for conflicts</p>
            <Button variant="primary" fullWidth size="sm">
              Check Now
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <BarChart3 size={32} className="text-orange-600 mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-2">Analytics</h3>
            <p className="text-sm text-slate-600 mb-4">View detailed utilization reports</p>
            <Button variant="primary" fullWidth size="sm">
              View Reports
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;