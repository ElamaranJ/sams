import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Lock, Bell, Globe, Moon, Sun,
  Shield, Database, Smartphone, Save, X
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Lock },
  ];

  const handleProfileUpdate = () => {
    // Add your profile update logic here
    console.log('Profile updated:', profileData);
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // Add your password change logic here
    console.log('Password change requested');
    setShowPasswordModal(false);
    alert('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            Settings ⚙️
          </h1>
          <p className="text-lg text-slate-600">Manage your account preferences</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6">
                  Profile Information
                </h2>
                
                <div className="flex items-center gap-6 mb-8 pb-8 border-b-2 border-slate-100">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{user?.name}</h3>
                    <p className="text-slate-600 mb-2">{user?.email}</p>
                    <Button variant="secondary" size="sm">Change Avatar</Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      icon={User}
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                    <Input
                      label="Email Address"
                      icon={Mail}
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Phone Number"
                      icon={Smartphone}
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="Enter your phone number"
                    />
                    <Input
                      label="Role"
                      icon={Shield}
                      value={user?.role || 'Student'}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      rows="4"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button icon={Save} onClick={handleProfileUpdate}>
                      Save Changes
                    </Button>
                    <Button variant="ghost">
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6">
                  Notification Preferences
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Mail size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Email Notifications</div>
                        <div className="text-sm text-slate-600">Receive updates via email</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        emailNotifications ? 'bg-green-500' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                        emailNotifications ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Bell size={24} className="text-purple-600" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Push Notifications</div>
                        <div className="text-sm text-slate-600">Receive push notifications</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        pushNotifications ? 'bg-green-500' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                        pushNotifications ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-100">
                    <h3 className="font-bold text-slate-900 mb-4">Email me about:</h3>
                    <div className="space-y-3">
                      {['Assignment updates', 'Grade changes', 'Attendance alerts', 'Course announcements'].map((item) => (
                        <label key={item} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
                          <span className="text-slate-700">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <Card className="p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6">
                  Appearance Settings
                </h2>

                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-xl">
                    <h3 className="font-bold text-slate-900 mb-4">Theme</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button className="p-4 bg-white rounded-xl border-2 border-slate-900 shadow-lg">
                        <Sun size={24} className="text-amber-500 mx-auto mb-2" />
                        <div className="font-semibold text-slate-900">Light</div>
                      </button>
                      <button className="p-4 bg-slate-800 rounded-xl border-2 border-slate-300">
                        <Moon size={24} className="text-blue-400 mx-auto mb-2" />
                        <div className="font-semibold text-white">Dark</div>
                      </button>
                      <button className="p-4 bg-gradient-to-br from-slate-50 to-slate-800 rounded-xl border-2 border-slate-300">
                        <Globe size={24} className="text-purple-500 mx-auto mb-2" />
                        <div className="font-semibold text-slate-700">Auto</div>
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-xl">
                    <h3 className="font-bold text-slate-900 mb-4">Font Size</h3>
                    <input 
                      type="range" 
                      min="12" 
                      max="20" 
                      defaultValue="16"
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-600 mt-2">
                      <span>Small</span>
                      <span>Medium</span>
                      <span>Large</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card className="p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-bold text-slate-900">Password</div>
                        <div className="text-sm text-slate-600">Last changed 30 days ago</div>
                      </div>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => setShowPasswordModal(true)}
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">Two-Factor Authentication</div>
                        <div className="text-sm text-slate-600">Add an extra layer of security</div>
                      </div>
                      <Button variant="secondary" size="sm">
                        Enable
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
                    <h3 className="font-bold text-green-800 mb-3">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          <Smartphone className="text-green-600" size={20} />
                          <div>
                            <div className="font-semibold text-slate-900">Current Device</div>
                            <div className="text-xs text-slate-600">Chennai, India • Now</div>
                          </div>
                        </div>
                        <span className="text-xs text-green-600 font-bold">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <Card className="p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6">
                  Privacy Settings
                </h2>

                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-xl">
                    <h3 className="font-bold text-slate-900 mb-4">Profile Visibility</h3>
                    <select className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none">
                      <option>Everyone</option>
                      <option>Classmates only</option>
                      <option>Private</option>
                    </select>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-xl">
                    <h3 className="font-bold text-slate-900 mb-4">Data & Privacy</h3>
                    <div className="space-y-3">
                      <Button variant="secondary" fullWidth>
                        <Database size={20} />
                        Download My Data
                      </Button>
                      <Button variant="ghost" fullWidth className="text-red-600 hover:bg-red-50">
                        Delete My Account
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Password Change Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
        >
          <div className="space-y-4">
            <Input
              label="Current Password"
              icon={Lock}
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              placeholder="Enter current password"
            />
            <Input
              label="New Password"
              icon={Lock}
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              placeholder="Enter new password"
            />
            <Input
              label="Confirm New Password"
              icon={Lock}
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              placeholder="Confirm new password"
            />
            
            <div className="flex gap-3 pt-4">
              <Button onClick={handlePasswordChange} fullWidth>
                Update Password
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowPasswordModal(false)}
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Settings;