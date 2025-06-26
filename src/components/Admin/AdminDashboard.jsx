import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, UserCheck, Settings, LogOut, RefreshCw, CalendarCheck2, ClipboardList, Users, UserX, Clock } from 'lucide-react';
import Notifications from './Notifications';
import RegProgress from './RegProgress';
import ViewReg from './ViewReg';
import ManageCourse from './ManageCourse';
import ManageStudent from './ManageStudent';
import { supabase } from '../../../supabaseClient';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      notifications: true,
      autoRefresh: false,
      darkMode: false,
      emailNotifications: true,
      soundNotifications: true,
      compactMode: false,
      theme: 'system',
      language: 'en'
    };
  });
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    inProgress: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    // Apply theme changes
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply compact mode
    if (settings.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }, [settings]);

  const handleSettingsChange = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleThemeChange = (theme) => {
    setSettings(prev => ({
      ...prev,
      theme
    }));
  };

  const handleLanguageChange = (language) => {
    setSettings(prev => ({
      ...prev,
      language
    }));
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      notifications: true,
      autoRefresh: false,
      darkMode: false,
      emailNotifications: true,
      soundNotifications: true,
      compactMode: false,
      theme: 'system',
      language: 'en'
    };
    setSettings(defaultSettings);
  };

  const handleRefreshData = () => {
    window.location.reload();
  };

  const tabs = [
    {
      label: 'Notifications',
      icon: <Bell size={16} />,
      activeClass: 'bg-blue-500 text-white',
      inactiveClass: 'bg-blue-100 text-blue-800',
    },
    {
      label: 'Registration Progress',
      icon: <ClipboardList size={16} />,
      activeClass: 'bg-emerald-700 text-white',
      inactiveClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'View Registration',
      icon: <CalendarCheck2 size={16} />,
      activeClass: 'bg-emerald-700 text-white',
      inactiveClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'Manage Course Applications',
      icon: <CalendarCheck2 size={16} />,
      activeClass: 'bg-emerald-700 text-white',
      inactiveClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'Manage Students',
      icon: <Users size={16} />,
      activeClass: 'bg-blue-500 text-white',
      inactiveClass: 'bg-blue-100 text-blue-800',
      variant: 'secondary',
    },
  ];

  const handleLogout = () => {
    // Add token/session clearing here if needed in the future
    navigate('/');
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all registrations with their progress
      const { data: registrations, error } = await supabase
        .from('register')
        .select('*, progress_management(*)');

      if (error) throw error;

      // Calculate statistics
      const stats = {
        total: registrations.length,
        approved: registrations.filter(r => r.progress_management?.application_review === 'approved').length,
        inProgress: registrations.filter(r => r.progress_management?.application_review === 'in_progress').length,
        rejected: registrations.filter(r => r.progress_management?.application_review === 'rejected').length
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full mb-2" />
                <div className="w-24 h-4 bg-gray-200 rounded mb-2" />
                <div className="w-8 h-6 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${settings.darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-[#1e2a38] text-white flex flex-col py-6 px-4">
        <div className="text-center text-3xl font-bold text-cyan-400 mb-2">GAS</div>
        <div className="text-center text-lg font-semibold mb-6">ADMIN PANEL</div>
        <nav className="flex flex-col gap-0.5">
          <button
            className={`flex items-center w-full px-3 py-2 mb-2 rounded hover:bg-gray-700 transition-colors text-left gap-2 ${activeTab === null ? 'bg-gray-700 font-bold' : ''}`}
            style={{ background: activeTab === null ? '#223047' : 'none' }}
            onClick={() => setActiveTab(null)}
          >
            <Users className="text-blue-400" /> Dashboard
          </button>
          <button
            className="flex items-center w-full px-3 py-2 mb-2 rounded hover:bg-cyan-700 transition-colors text-left gap-2"
            onClick={() => navigate('/enrolled-students')}
          >
            <ClipboardList className="text-cyan-400" size={16} /> Enrolled Students
          </button>
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              className={`flex items-center w-full px-3 py-2 mb-2 rounded hover:bg-gray-700 transition-colors text-left gap-2 ${activeTab === idx ? 'bg-gray-700 font-bold' : ''}`}
              style={{ background: activeTab === idx ? '#223047' : 'none' }}
              onClick={() => setActiveTab(idx)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          <button onClick={() => setShowSettings(true)} className="flex items-center px-3 py-2 hover:bg-gray-700 rounded text-left gap-2">
            <Settings size={16} /> Settings
          </button>
          <button onClick={handleLogout} className="flex items-center px-3 py-2 hover:bg-red-600 rounded text-left gap-2 text-red-300 hover:text-white transition-colors mt-2">
            <LogOut size={16} /> Logout
          </button>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="text-blue-600" /> Admin Dashboard
          </h1>
          <button onClick={handleRefreshData} className="flex items-center gap-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors">
            <RefreshCw size={16} /> Refresh Data
          </button>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-full max-w-sm relative transform transition-all duration-300 ease-in-out ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-xl"
                onClick={() => setShowSettings(false)}
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-3">Settings</h2>

              {/* Profile Section */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="w-12 h-12 rounded-full bg-blue-200 dark:bg-blue-600 flex items-center justify-center text-xl font-bold text-blue-700 dark:text-blue-200">A</div>
                <div>
                  <div className="font-semibold">Admin User</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">admin@email.com</div>
                </div>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">In-App Notifications</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Receive notifications within the application</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.notifications}
                      onChange={() => handleSettingsChange('notifications')}
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Sound Notifications</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Play a sound for new notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.soundNotifications}
                      onChange={() => handleSettingsChange('soundNotifications')}
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Auto Refresh</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Automatically refresh data periodically</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.autoRefresh}
                      onChange={() => handleSettingsChange('autoRefresh')}
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Compact Mode</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reduce spacing for a denser UI</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.compactMode}
                      onChange={() => handleSettingsChange('compactMode')}
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Dark Mode</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Switch to dark theme</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.darkMode}
                      onChange={() => handleSettingsChange('darkMode')}
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Color Theme</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred color theme</p>
                  </div>
                  <select 
                    className="border rounded p-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.theme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="blue">Blue</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Language</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Select your preferred language</p>
                  </div>
                  <select 
                    className="border rounded p-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="sw">Swahili</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Email Notifications</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.emailNotifications}
                      onChange={() => handleSettingsChange('emailNotifications')}
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button 
                  className="w-full py-1.5 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold transition-colors text-sm"
                  onClick={() => {/* Implement change password functionality */}}
                >
                  Change Password
                </button>
                <button 
                  className="w-full py-1.5 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold transition-colors text-sm"
                  onClick={handleResetSettings}
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Cards and View Registration (default view) */}
        {activeTab === null && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-blue-500 text-white">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Users size={32} />
                  <p className="text-lg font-semibold">Total Registrations</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-500 text-white">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <UserCheck size={32} />
                  <p className="text-lg font-semibold">Approved</p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </CardContent>
              </Card>
              <Card className="bg-yellow-400 text-white">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Clock size={32} />
                  <p className="text-lg font-semibold">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </CardContent>
              </Card>
              <Card className="bg-red-500 text-white">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <UserX size={32} />
                  <p className="text-lg font-semibold">Rejected</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </CardContent>
              </Card>
            </div>
            <ViewReg />
          </>
        )}
        {/* Tab Content */}
        {activeTab !== null && (
          <div className="mt-2">
            {activeTab === 0 && <Notifications />}
            {activeTab === 1 && <RegProgress />}
            {activeTab === 2 && <ViewReg />}
            {activeTab === 3 && <ManageCourse />}
            {activeTab === 4 && <ManageStudent />}
          </div>
        )}
      </main>
    </div>
  );
}
