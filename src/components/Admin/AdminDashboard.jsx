import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, UserCheck, Settings, LogOut, RefreshCw, CalendarCheck2, ClipboardList, Users } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="text-blue-600" /> Admin Dashboard
        </h1>
        <div className="space-x-2">
          <Button variant="outline" className="flex items-center gap-1"><Settings size={16} /> Settings</Button>
          <Button variant="secondary" className="flex items-center gap-1"><RefreshCw size={16} /> Refresh Data</Button>
          <Button variant="destructive" className="flex items-center gap-1"><LogOut size={16} /> Logout</Button>
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

      <div className="flex flex-wrap gap-3">
        <Button className="bg-blue-500 text-white flex items-center gap-2"><Bell size={16} /> Notifications</Button>
        <Button className="bg-emerald-700 text-white flex items-center gap-2"><ClipboardList size={16} /> Registration Progress</Button>
        <Button className="bg-emerald-700 text-white flex items-center gap-2"><CalendarCheck2 size={16} /> Access Registration</Button>
        <Button className="bg-emerald-700 text-white flex items-center gap-2"><CalendarCheck2 size={16} /> Manage Course Applications</Button>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Student Registrations</h2>
        <div className="space-x-2">
          <Button variant="secondary" className="flex items-center gap-1 text-blue-700"><Users size={16} /> Show Active Students</Button>
          <Button variant="outline">Show All</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Student Num</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Course</th>
              <th className="px-4 py-2">Registration Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row */}
            <tr>
              <td className="border px-4 py-2">STU001</td>
              <td className="border px-4 py-2">John Doe</td>
              <td className="border px-4 py-2">john@example.com</td>
              <td className="border px-4 py-2">React Basics</td>
              <td className="border px-4 py-2">Approved</td>
              <td className="border px-4 py-2">Edit | Delete</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
