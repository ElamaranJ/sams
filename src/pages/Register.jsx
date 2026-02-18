import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, GraduationCap, Building2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', department: '', studentId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = await register(formData.email, formData.password, {
        name: formData.name,
        role: formData.role,
        department: formData.department,
        studentId: formData.studentId
      });
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'student', label: 'Student', color: '#4f46e5' },
    { value: 'faculty', label: 'Faculty', color: '#7c3aed' },
    { value: 'admin', label: 'Admin', color: '#6d28d9' },
  ];

  const inputStyle = {
    background: 'rgba(248,250,252,0.8)',
    border: '1.5px solid #e2e8f0',
  };

  const InputField = ({ label, type = 'text', value, onChange, placeholder, icon: Icon, disabled, children }) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full py-3 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 transition-all outline-none"
          style={{ ...inputStyle, paddingLeft: Icon ? '2.75rem' : '1rem', paddingRight: children ? '3rem' : '1rem' }}
          onFocus={e => e.target.style.borderColor = '#4f46e5'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
        {children}
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0f9ff 100%)' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-xl"
        style={{ border: '1px solid rgba(255,255,255,0.9)' }}>
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h2>
        <p className="text-slate-500 text-sm">Redirecting you to sign in…</p>
      </motion.div>
    </div>
  );

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0f9ff 100%)' }}
    >
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[40%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #6d28d9 0%, #4f46e5 60%, #3730a3 100%)' }}>

        <div className="absolute top-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #fff, transparent)' }} />
        <div className="absolute bottom-[-40px] left-[-40px] w-[240px] h-[240px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #c4b5fd, transparent)' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <GraduationCap size={22} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">SAMS</span>
        </div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/90 text-xs font-semibold">Join thousands of users</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
              Start your<br />
              <span className="text-violet-200">academic journey.</span>
            </h1>
            <p className="text-violet-200 text-sm leading-relaxed max-w-xs">
              Create your SAMS account and get instant access to smart attendance tracking, grade analytics, and more.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-10 grid grid-cols-3 gap-4"
          >
            {[['10K+', 'Students'], ['500+', 'Faculty'], ['50+', 'Colleges']].map(([num, label]) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{num}</div>
                <div className="text-violet-200 text-xs font-medium">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10">
          <p className="text-violet-300 text-xs">© 2025 SAMS. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md my-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">SAMS</span>
          </div>

          {/* Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl"
            style={{ border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 60px rgba(79,70,229,0.08), 0 4px 20px rgba(0,0,0,0.06)' }}>

            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900 mb-1" style={{ letterSpacing: '-0.01em' }}>Create account</h2>
              <p className="text-slate-500 text-sm">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4"
                >
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </motion.div>
              )}

              {/* Role selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">I am a…</label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => update('role', r.value)}
                      disabled={loading}
                      className="py-2.5 px-3 rounded-xl text-sm font-semibold transition-all"
                      style={formData.role === r.value
                        ? { background: r.color, color: '#fff', boxShadow: `0 4px 14px ${r.color}40` }
                        : { background: '#f1f5f9', color: '#64748b' }
                      }
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full name */}
              <InputField label="Full name" value={formData.name} onChange={e => update('name', e.target.value)}
                placeholder="John Doe" icon={User} disabled={loading} />

              {/* Email */}
              <InputField label="Email address" type="email" value={formData.email} onChange={e => update('email', e.target.value)}
                placeholder="you@university.edu" icon={Mail} disabled={loading} />

              {/* Student ID */}
              {formData.role === 'student' && (
                <InputField label="Student ID (optional)" value={formData.studentId} onChange={e => update('studentId', e.target.value)}
                  placeholder="STU001" icon={GraduationCap} disabled={loading} />
              )}

              {/* Department */}
              {(formData.role === 'faculty' || formData.role === 'admin') && (
                <InputField label="Department (optional)" value={formData.department} onChange={e => update('department', e.target.value)}
                  placeholder="Computer Science" icon={Building2} disabled={loading} />
              )}

              {/* Password */}
              <InputField label="Password" type={showPassword ? 'text' : 'password'} value={formData.password}
                onChange={e => update('password', e.target.value)} placeholder="Min. 6 characters" icon={Lock} disabled={loading}>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </InputField>

              {/* Confirm password */}
              <InputField label="Confirm password" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)} placeholder="Re-enter password" icon={Lock} disabled={loading} />

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mt-2"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 20px rgba(79,70,229,0.35)' }}
              >
                {loading && <div className="spinner spinner-sm" />}
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign in</Link>
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            <Link to="/" className="hover:text-slate-600 transition-colors">← Back to home</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;