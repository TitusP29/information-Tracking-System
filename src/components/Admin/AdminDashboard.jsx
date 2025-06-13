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
  const [activeTab, setActiveTab] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    autoRefresh: false,
    darkMode: false,
    emailNotifications: true
  });
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    inProgress: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  const handleSettingsChange = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="text-blue-600" /> Admin Dashboard
        </h1>
        <div className="space-x-2">
          <Button variant="outline" className="flex items-center gap-1" onClick={() => setShowSettings(true)}>
            <Settings size={16} /> Settings
          </Button>
          <Button variant="secondary" className="flex items-center gap-1" onClick={handleRefreshData}>
            <RefreshCw size={16} /> Refresh Data
          </Button>
          <Button variant="destructive" className="flex items-center gap-1" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setShowSettings(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">In-App Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications within the application</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications}
                    onChange={() => handleSettingsChange('notifications')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Auto Refresh</h3>
                  <p className="text-sm text-gray-500">Automatically refresh data periodically</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.autoRefresh}
                    onChange={() => handleSettingsChange('autoRefresh')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Switch to dark theme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.darkMode}
                    onChange={() => handleSettingsChange('darkMode')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.emailNotifications}
                    onChange={() => handleSettingsChange('emailNotifications')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Save settings logic here
                setShowSettings(false);
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Tabbed Navbar */}
      <div className="flex flex-wrap gap-3 border-b pb-2 mb-4">
        {tabs.map((tab, idx) => (
          <Button
            key={tab.label}
            className={`flex items-center gap-2 ${activeTab === idx ? tab.activeClass : tab.inactiveClass}`}
            variant={tab.variant || 'default'}
            onClick={() => setActiveTab(idx)}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-2">
        {activeTab === 0 && <Notifications />}
        {activeTab === 1 && <RegProgress />}
        {activeTab === 2 && <ViewReg />}
        {activeTab === 3 && <ManageCourse />}
        {activeTab === 4 && <ManageStudent />}
      </div>
    </div>
  );
}
