import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, Clock, Star, Award, ArrowRight,
  FileText, PlayCircle, Plus, Zap, Shield, TrendingUp,
  CheckCircle, Sparkles, GraduationCap, QrCode
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';

// ============= HERO SECTION =============
const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            x: [0, -100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-lg rounded-full mb-6 border border-white/30"
            >
              <Sparkles size={16} className="text-yellow-300" />
              <span className="font-bold text-sm">Smart Attendance Management</span>
            </motion.div>

            <h1 className="text-7xl font-black mb-6 leading-tight">
              Transform Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-white">
                Academic Journey
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-10 max-w-lg leading-relaxed font-medium">
              Experience seamless attendance tracking with QR codes, smart assignment management, and real-time analytics. The future of education is here.
            </p>

            <div className="flex items-center gap-4 mb-12">
              <Link to="/register">
                <Button variant="white" size="lg" className="bg-white text-purple-600 hover:bg-white/90 shadow-2xl">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="lg" className="border-2 border-white/50 text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-black mb-1">10K+</div>
                <div className="text-white/80 text-sm font-semibold">Students</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-1">500+</div>
                <div className="text-white/80 text-sm font-semibold">Faculty</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-1">98%</div>
                <div className="text-white/80 text-sm font-semibold">Satisfaction</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Card */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl p-8 mb-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <GraduationCap size={32} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">SAMS Platform</div>
                      <div className="text-white/60 text-sm">Smart & Efficient</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { icon: QrCode, label: 'QR Attendance', color: 'from-cyan-500 to-blue-500' },
                      { icon: FileText, label: 'Smart Assignments', color: 'from-purple-500 to-pink-500' },
                      { icon: TrendingUp, label: 'Real-time Analytics', color: 'from-orange-500 to-red-500' }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center`}>
                          <item.icon size={20} className="text-white" />
                        </div>
                        <span className="text-white font-semibold">{item.label}</span>
                        <CheckCircle size={18} className="text-green-400 ml-auto" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-white mb-1">100%</div>
                    <div className="text-white/60 text-xs font-semibold">Accuracy</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-white mb-1">24/7</div>
                    <div className="text-white/60 text-xs font-semibold">Access</div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 shadow-2xl"
              >
                <Star size={32} className="text-white" fill="currentColor" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-4 shadow-2xl"
              >
                <Zap size={32} className="text-white" fill="currentColor" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ============= FEATURES SECTION =============
const FeaturesSection = () => {
  const features = [
    {
      icon: QrCode,
      title: 'QR Code Attendance',
      description: 'Scan and mark attendance in seconds with secure QR codes',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      icon: FileText,
      title: 'Smart Assignments',
      description: 'Create, submit, and evaluate assignments seamlessly',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Track progress with comprehensive dashboards and reports',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for all your academic data',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Connect with students and faculty effortlessly',
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      icon: Award,
      title: 'Performance Tracking',
      description: 'Monitor grades, attendance, and achievements',
      gradient: 'from-amber-500 to-yellow-600'
    }
  ];

  return (
    <div className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-black text-slate-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Powerful features designed to make academic management effortless
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="p-8 h-full">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============= VIDEO SECTION =============
const VideoSection = () => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef(null);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-black text-slate-900 mb-4">
            See SAMS in Action
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Watch how easy it is to manage attendance and assignments
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-2 shadow-2xl">
            <div className="bg-slate-900 rounded-2xl overflow-hidden">
              <div className="aspect-video relative group">
                {/* Actual Video Element */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover rounded-xl"
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  poster="/promo-video-poster.jpg"
                >
                  <source src="/promo-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Play Button Overlay (shows when not playing) */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                    <motion.button
                      onClick={handlePlayVideo}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-purple-500/50 transition-all"
                    >
                      <PlayCircle size={48} className="text-purple-600" fill="currentColor" />
                    </motion.button>

                    {/* Decorative Elements */}
                    <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                      <span className="text-white text-sm font-bold">🔴 LIVE DEMO</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: QrCode, title: 'QR Scanning', desc: 'Instant attendance marking' },
              { icon: FileText, title: 'Assignment Flow', desc: 'Create to evaluate in minutes' },
              { icon: TrendingUp, title: 'Analytics', desc: 'Real-time insights' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <item.icon size={28} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ============= CTA SECTION =============
const CTASection = () => {
  return (
    <div className="relative py-24 overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
      <div className="absolute inset-0">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-black mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of students and educators already using SAMS
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 shadow-2xl px-8 py-4 text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="lg" className="border-2 border-white/50 text-white hover:bg-white/10 px-8 py-4 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ============= MAIN LANDING PAGE =============
const Landing = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <VideoSection />
      <CTASection />
    </div>
  );
};

export default Landing;