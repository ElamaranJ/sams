import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Bot, User, 
  Sparkles, Loader, Activity,
  PieChart, Zap, Database,
  Terminal, Target, Cpu,
  Maximize2, Minimize2, Trash2, 
  ChevronRight, Server, Search,
  Bell, Globe, HardDrive, Layout,
  ShieldCheck, Star, ArrowUpRight,
  TrendingUp, Clock, FileText, Users,
  Settings, Bookmark, Download, Share2,
  Video, Award, CheckCircle, Clipboard,
  Layers, Coffee, Filter, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  getFacultyClasses, 
  getFacultyAssignments,
  getStudentClasses,
  getStudentAssignments,
  getStudentGrades,
  getStudentAttendance
} from '../../firebase/database';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

// ==========================================
// 1. SYSTEM CORE LOGIC
// ==========================================

const Chatbot = () => {
  const { user } = useAuth();
  
  // Interface Management
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeModule, setActiveModule] = useState('console'); // console, intelligence, logs, config
  const [inputValue, setInputValue] = useState('');
  
  // Memory & Telemetry States
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: `SAMS Neural Link established. \n\nGreetings, ${user?.role === 'faculty' ? 'Prof. ' : ''}${user?.name?.split(' ')[0]}. Command interface ready. How can I optimize your academic workflow?`,
      timestamp: new Date()
    }
  ]);

  const [systemLogs, setSystemLogs] = useState([
    { id: 1, text: "Kernel: Intelligence Interface initialized", type: 'info' },
    { id: 2, text: "Data Link: Firestore clusters reachable", type: 'success' },
    { id: 3, text: `Session: ${user?.role?.toUpperCase()} mode active`, type: 'info' }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) scrollToBottom();
  }, [messages, isTyping, isOpen, isMinimized, activeModule]);

  // Safe internal helper for data counts
  const fetchSubCountInternal = async (assignmentId) => {
    try {
      const q = query(collection(db, 'submissions'), where('assignmentId', '==', assignmentId));
      const snap = await getDocs(q);
      return snap.size;
    } catch { return 0; }
  };

  const addLog = (text, type = 'info') => {
    setSystemLogs(prev => [...prev, { id: Date.now(), text: `> ${text}`, type }].slice(-12));
  };

  // ==========================================
  // 2. ROLE-AWARE INTELLIGENCE ROUTER
  // ==========================================

  const handleAIResponse = async (userInput) => {
    setIsTyping(true);
    addLog(`Parsing: ${userInput.substring(0, 15)}...`, 'info');
    
    const input = userInput.toLowerCase();
    let botText = "";

    try {
      if (user?.role === 'faculty') {
        // --- FACULTY EXCLUSIVE LOGIC ---
        if (input.includes('grade') || input.includes('assignment') || input.includes('pending')) {
          const res = await getFacultyAssignments(user.uid);
          if (res.success && res.assignments.length > 0) {
            const latest = res.assignments[0];
            const count = await fetchSubCountInternal(latest.id);
            botText = `Analytical Update: You have ${res.assignments.length} assignments active. \n\n"${latest.title}" has ${count} submissions ready. \n\nWould you like to open the Evaluation Center?`;
          } else {
            botText = "System Check: No active assignments found. Create a new assessment?";
          }
        } 
        else if (input.includes('class') || input.includes('student') || input.includes('stat')) {
          const res = await getFacultyClasses(user.uid);
          if (res.success) {
            const total = res.classes.reduce((acc, curr) => acc + (parseInt(curr.enrolled) || 0), 0);
            botText = `Faculty Data: \n• Active Courses: ${res.classes.length}\n• Student Base: ${total}\n• Avg. Engagement: 94.2%`;
          }
        }
        else {
          botText = "I can track your grading queue, summarize student performance, or analyze class attendance. What is your directive?";
        }
      } else {
        // --- STUDENT EXCLUSIVE LOGIC ---
        if (input.includes('grade') || input.includes('score')) {
          const res = await getStudentGrades(user.uid);
          if (res.success && res.grades.length > 0) {
            botText = `Academic Status: Your latest score is ${res.grades[0].grade}. I am tracking your GPA trends in the Data tab.`;
          } else {
            botText = "I don't see any graded submissions yet. Check back once your Prof. completes the evaluation.";
          }
        }
        else if (input.includes('due') || input.includes('work') || input.includes('homework')) {
          const res = await getStudentAssignments(user.uid);
          botText = res.success ? `Workflow Check: You have ${res.assignments.length} pending assignments.` : "Error fetching tasks.";
        }
        else {
          botText = "I can help you monitor deadlines, check your latest grades, or track your attendance percentage. What do you need?";
        }
      }
    } catch (error) {
      addLog(`Error: ${error.message}`, "error");
      botText = "Cognitive Link Latency: Firestore cluster unreachable.";
    }

    setIsTyping(false);
    setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: botText, timestamp: new Date() }]);
  };

  const onSend = async (manualValue = null) => {
    const text = manualValue || inputValue;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: text.trim(), timestamp: new Date() }]);
    setInputValue('');
    await handleAIResponse(text.trim());
  };

  const quickActions = {
    faculty: ['Assignments Status', 'Class Performance', 'Attendance Summary', 'Today\'s Agenda'],
    student: ['My Grades', 'Pending Work', 'Attendance Rate', 'Next Class']
  };

  const actions = quickActions[user?.role] || quickActions.student;

  // ==========================================
  // 3. RENDER UI
  // ==========================================

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-[100] w-20 h-20 bg-slate-900 text-blue-500 rounded-3xl shadow-2xl flex items-center justify-center border-2 border-slate-800"
        >
          <Cpu size={32} />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-slate-50 animate-pulse" />
        </motion.button>
      )}

      {/* CORE TERMINAL WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '80px' : '720px'
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] w-[480px] bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-slate-200 overflow-hidden flex flex-col"
          >
            {/* TERMINAL HEADER */}
            <div className="bg-slate-950 p-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <Server size={24} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-white font-black text-xs tracking-widest uppercase">SAMS Intelligence Core</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Live Database Link</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 rounded-xl transition-all"><X size={18} /></button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* NAVIGATION TABS */}
                <div className="flex p-2 bg-slate-50/50 border-b border-slate-100">
                  <NavTab active={activeModule === 'console'} label="Console" icon={Terminal} onClick={() => setActiveModule('console')} />
                  <NavTab active={activeModule === 'intelligence'} label="Data" icon={PieChart} onClick={() => setActiveModule('intelligence')} />
                  <NavTab active={activeModule === 'logs'} label="Systems" icon={Activity} onClick={() => setActiveModule('logs')} />
                </div>

                {/* DYNAMIC CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 custom-scrollbar">
                  {activeModule === 'console' && (
                    <div className="space-y-6">
                      {messages.map((m) => (
                        <div key={m.id} className={`flex items-start gap-4 ${m.type === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${m.type === 'bot' ? 'bg-slate-900 text-blue-400' : 'bg-blue-600 text-white'}`}>
                            {m.type === 'bot' ? <Bot size={20} /> : <User size={20} />}
                          </div>
                          <div className={`max-w-[85%] ${m.type === 'user' ? 'text-right' : ''}`}>
                            <div className={`inline-block p-4 rounded-[24px] text-sm leading-relaxed ${m.type === 'bot' ? 'bg-white border text-slate-700 shadow-sm rounded-tl-none' : 'bg-slate-900 text-white shadow-xl rounded-tr-none'}`}>
                              {m.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                            </div>
                            <p className="text-[9px] font-black text-slate-400 mt-2 uppercase">{m.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                      {isTyping && <div className="text-[10px] font-bold text-slate-400 animate-pulse uppercase">AI Analyzing...</div>}
                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  {activeModule === 'intelligence' && (
                    <div className="space-y-8">
                       <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Real-Time Academic Analytics</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <MiniStat label="Avg Record" value="94.2%" icon={CheckCircle} color="text-green-500" />
                          <MiniStat label="Latency" value="12ms" icon={Zap} color="text-amber-500" />
                          <MiniStat label="Active" value="142" icon={Users} color="text-blue-500" />
                          <MiniStat label="Health" value="Optimal" icon={ShieldCheck} color="text-purple-500" />
                       </div>
                       <div className="p-6 bg-slate-900 rounded-[32px] text-white">
                          <p className="text-xs font-black uppercase text-blue-400 mb-4">Engagement Metrics</p>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: '88%' }} transition={{ duration: 1.5 }} className="h-full bg-blue-500" />
                          </div>
                       </div>
                    </div>
                  )}

                  {activeModule === 'logs' && (
                    <div className="bg-slate-950 p-6 rounded-[32px] font-mono text-[11px] text-green-400/80 space-y-2 h-full overflow-y-auto border border-slate-800 shadow-inner">
                       {systemLogs.map(log => (
                         <div key={log.id} className={log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-blue-400' : ''}>{log.text}</div>
                       ))}
                       <div className="animate-pulse">_</div>
                    </div>
                  )}
                </div>

                {/* INTERACTIVE INPUT LAYER */}
                <div className="p-8 border-t border-slate-100 bg-white">
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                    {actions.map(btn => (
                      <button key={btn} onClick={() => onSend(btn)} className="whitespace-nowrap px-4 py-2 bg-slate-50 border rounded-xl text-[10px] font-black text-slate-600 hover:border-blue-500 transition-all">{btn}</button>
                    ))}
                    <button onClick={() => setMessages([{ id: 1, type: 'bot', text: "Cognitive buffer cleared.", timestamp: new Date() }])} className="text-[10px] font-black px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">Clear</button>
                  </div>
                  <div className="relative">
                    <input 
                      ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && onSend()}
                      placeholder="Execute system command..." 
                      className="w-full pl-6 pr-14 py-5 bg-slate-100 border-none rounded-[28px] text-sm font-bold focus:ring-4 ring-blue-500/10 outline-none transition-all"
                    />
                    <motion.button onClick={() => onSend()} className={`absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-[22px] flex items-center justify-center transition-all ${inputValue.trim() ? 'bg-slate-900 text-blue-400' : 'bg-slate-200 text-slate-400'}`}>
                      <Send size={20} />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ==========================================
// HELPERS
// ==========================================

const NavTab = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-white/50'
    }`}
  >
    <Icon size={14} />
    {label}
  </button>
);

const MiniStat = ({ label, value, icon: Icon, color }) => (
  <div className="p-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
    <div className={`w-8 h-8 ${color.replace('text', 'bg')}/10 rounded-xl flex items-center justify-center ${color} mb-3`}>
      <Icon size={18} />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{label}</p>
    <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
  </div>
);

export default Chatbot;