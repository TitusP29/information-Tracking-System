import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, UserCheck, Settings, LogOut, RefreshCw, CalendarCheck2, ClipboardList, Users } from 'lucide-react';
import Notifications from './Notifications';
import RegProgress from './RegProgress';
import ViewReg from './ViewReg';
import ManageCourse from './ManageCourse';
import ManageStudent from './ManageStudent';
import { useState } from 'react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="text-blue-600" /> Admin Dashboard
        </h1>
        <div className="space-x-2">
          <Button variant="outline" className="flex items-center gap-1"><Settings size={16} /> Settings</Button>
          <Button variant="secondary" className="flex items-center gap-1"><RefreshCw size={16} /> Refresh Data</Button>
          <Button variant="destructive" className="flex items-center gap-1" onClick={handleLogout}><LogOut size={16} /> Logout</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-500 text-white">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Users size={32} />
            <p className="text-lg font-semibold">Total Registrations</p>
            <p className="text-2xl font-bold">5</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500 text-white">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <UserCheck size={32} />
            <p className="text-lg font-semibold">Approved</p>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-400 text-white">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <UserCheck size={32} />
            <p className="text-lg font-semibold">Pre-Approved</p>
            <p className="text-2xl font-bold">2</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500 text-white">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <UserCheck size={32} />
            <p className="text-lg font-semibold">Rejected</p>
            <p className="text-2xl font-bold">0</p>
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
