import React from "react";
import { useNavigate, Outlet } from 'react-router-dom';

const students = [
  {
    id: "CS/24/001",
    name: "John Doe",
    dob: "Jan 5, 2001",
    course: "BSc Computer Science",
    status: "Active",
  },
  {
    id: "EE/23/045",
    name: "Mary Johnson",
    dob: "Sep 17, 2000",
    course: "BEng Electrical Engineering",
    status: "Active",
  },
  {
    id: "ME/24/008",
    name: "Michael Smith",
    dob: "Feb 20, 2002",
    course: "BEng Mechanical Engineering",
    status: "Suspended",
  },
  {
    id: "CE/23/032",
    name: "Emily Brown",
    dob: "Jul 30, 2001",
    course: "BSc Civil Engineering",
    status: "Active",
  },
];

const StatusBadge = ({ status }) => {
  const statusColor =
    status === "Active"
      ? "bg-green-500"
      : status === "Suspended"
      ? "bg-orange-400"
      : "bg-gray-400";

  return (
    <span className={`text-white text-sm px-3 py-1 rounded-full ${statusColor}`}>
      {status}
    </span>
  );
};

const EnrolledStudents = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <nav className="space-y-2">
          <button className="block w-full text-left px-3 py-2 rounded bg-gray-700" onClick={() => navigate('/enrolled-students')}>Dashboard</button>
          <button className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700" onClick={() => navigate('/enrolled-students/attendance')}>Attendance</button>
          <button className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700" onClick={() => navigate('/enrolled-students/grades')}>Grades</button>
          <button className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700" onClick={() => navigate('/enrolled-students/fees-management')}>Fees Management</button>
          <button className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700" onClick={() => alert('Settings coming soon!')}>Settings</button>
          <button className="block w-full text-left px-3 py-2 rounded bg-red-600 hover:bg-red-700 mt-6" onClick={() => navigate('/')}>Logout</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Enrolled Students</h1>
          <div className="flex items-center gap-4">
            <input type="text" placeholder="Search" className="border px-4 py-2 rounded-lg w-64 focus:outline-none" />
            <button className="bg-cyan-700 text-white px-4 py-2 rounded-lg hover:bg-cyan-800 transition-colors" onClick={() => navigate('/dashboard')}>&larr; Back to Admin Dashboard</button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default EnrolledStudents;
