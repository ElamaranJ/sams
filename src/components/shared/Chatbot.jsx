import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Bot, User, 
  Sparkles, Loader, ChevronDown 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: `Hey ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI assistant. How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Quick action buttons based on user role
  const quickActions = {
    student: [
      '📚 My assignments',
      '📊 Check grades',
      '🎯 Attendance status',
      '📅 Upcoming classes'
    ],
    faculty: [
      '👥 View students',
      '📝 Create assignment',
      '✅ Pending evaluations',
      '📈 Class analytics'
    ],
    admin: [
      '👥 User statistics',
      '📊 System reports',
      '🔧 System health',
      '📅 Schedule overview'
    ]
  };

  const actions = quickActions[user?.role] || quickActions.student;

  // Simulate bot response (replace with actual API call)
  const getBotResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Simple response logic (replace with actual AI/API)
    let response = '';
    
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('assignment')) {
      response = user?.role === 'student' 
        ? "You have 2 pending assignments:\n\n1. Database Design Project (Due: Feb 20)\n2. Web Development Quiz (Due: Feb 22)\n\nWould you like to submit one now?"
        : "You have 12 assignments pending evaluation. The oldest submission was from 3 days ago. Would you like to start grading?";
    } else if (lowerMessage.includes('grade')) {
      response = user?.role === 'student'
        ? "Your current grades:\n\n• Computer Science 101: A-\n• Mathematics: B+\n• Web Design: A\n• Database Systems: B\n\nOverall GPA: 3.6/4.0 📈"
        : "Recent grading activity:\n\n• 24 assignments graded this week\n• Average grade: B+\n• 12 pending evaluations\n\nClass average: 82%";
    } else if (lowerMessage.includes('attendance')) {
      response = user?.role === 'student'
        ? "Your attendance record:\n\n✅ Overall: 94%\n📊 This month: 96%\n⚠️ Minimum required: 75%\n\nYou're doing great! Keep it up! 🎉"
        : "Class attendance overview:\n\n• Average attendance: 89%\n• Today's attendance: 92%\n• Students below 75%: 8\n\nWould you like to see detailed reports?";
    } else if (lowerMessage.includes('class') || lowerMessage.includes('schedule')) {
      response = user?.role === 'student'
        ? "Your classes today:\n\n🕐 10:00 AM - Computer Science 101\n🕑 1:00 PM - Mathematics\n🕒 3:00 PM - Web Design Lab\n\nNext class starts in 45 minutes!"
        : "Your teaching schedule today:\n\n🕐 9:00 AM - CS 101 (Lecture Hall A)\n🕐 11:00 AM - Database Systems (Room 204)\n🕑 2:00 PM - Web Development (Lab 3)\n\nCurrent class: Office Hours";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
      response = `I can help you with:\n\n${actions.map(action => `• ${action}`).join('\n')}\n\nJust click on any button or ask me a question!`;
    } else if (lowerMessage.includes('student') && user?.role === 'faculty') {
      response = "You have 156 students across all courses:\n\n• CS 101: 45 students\n• Database Systems: 38 students\n• Web Development: 42 students\n• Advanced Programming: 31 students\n\nWould you like to view details for a specific class?";
    } else if (lowerMessage.includes('report') || lowerMessage.includes('analytic')) {
      response = "Here's a quick summary:\n\n📊 Performance metrics look good!\n📈 Engagement is up 12% this week\n✅ All systems operational\n\nWould you like me to generate a detailed report?";
    } else {
      response = "I'm here to help! You can ask me about:\n\n• Assignments and submissions\n• Grades and performance\n• Attendance records\n• Class schedules\n• Course information\n\nWhat would you like to know?";
    }
    
    setIsTyping(false);
    
    return response;
  };

  const handleSendMessage = async (text = inputValue) => {
    if (!text.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Get bot response
    const botResponseText = await getBotResponse(text.trim());
    
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      text: botResponseText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
  };

  const handleQuickAction = (action) => {
    handleSendMessage(action);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl flex items-center justify-center text-white hover:shadow-blue-500/50 transition-shadow group"
          >
            <MessageSquare size={28} className="group-hover:scale-110 transition-transform" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] h-[650px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border-2 border-slate-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">AI Assistant</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-white/80 text-xs font-medium">Always here to help</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-white">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start gap-3 ${
                      message.type === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      message.type === 'bot'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg'
                        : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg'
                    }`}>
                      {message.type === 'bot' ? (
                        <Bot size={18} className="text-white" />
                      ) : (
                        <User size={18} className="text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`flex-1 ${message.type === 'user' ? 'flex justify-end' : ''}`}>
                      <div className={`inline-block max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                        message.type === 'bot'
                          ? 'bg-white border-2 border-slate-100'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      }`}>
                        <p className={`text-sm leading-relaxed whitespace-pre-line ${
                          message.type === 'bot' ? 'text-slate-700' : 'text-white'
                        }`}>
                          {message.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Bot size={18} className="text-white" />
                    </div>
                    <div className="bg-white border-2 border-slate-100 px-4 py-3 rounded-2xl shadow-sm">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                          className="w-2 h-2 bg-slate-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                          className="w-2 h-2 bg-slate-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                          className="w-2 h-2 bg-slate-400 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-3 border-t-2 border-slate-100 bg-slate-50">
              <div className="flex flex-wrap gap-2">
                {actions.slice(0, 4).map((action, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleQuickAction(action)}
                    className="text-xs px-3 py-1.5 bg-white border-2 border-slate-200 rounded-lg text-slate-700 font-semibold hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    {action}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t-2 border-slate-100 bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim()}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    inputValue.trim()
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;