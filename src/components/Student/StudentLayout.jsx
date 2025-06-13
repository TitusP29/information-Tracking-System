import React from "react";
import { FaUserCircle, FaGraduationCap, FaFileAlt, FaBell, FaSignOutAlt, FaChartBar } from "react-icons/fa";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { supabase } from '../../../supabaseClient';

const StudentLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#1e2a38] text-white flex flex-col py-6 px-4">
        <div className="text-center text-3xl font-bold text-cyan-400 mb-2">GAS</div>
        <div className="text-center text-lg font-semibold mb-6">GRACE ARTISAN SCHOOL</div>
        <Link to="/student" className="flex items-center px-3 py-2 hover:bg-gray-700 rounded mb-2">
          <FaChartBar className="mr-2" /> Dashboard
        </Link>
        <Link to="/application-intake" className="flex items-center px-3 py-2 hover:bg-gray-700 rounded mb-2">
          <FaGraduationCap className="mr-2" /> Application Intake
        </Link>
        <Link to="/registration-progress" className="flex items-center px-3 py-2 hover:bg-gray-700 rounded mb-2">
          <FaChartBar className="mr-2" /> Registration Progress
        </Link>
        <Link to="/documents" className="flex items-center px-3 py-2 hover:bg-gray-700 rounded mb-2">
          <FaFileAlt className="mr-2" /> Documents
        </Link>
        <Link to="/aboutus" className="flex items-center px-3 py-2 hover:bg-gray-700 rounded mb-2">
          <FaUserCircle className="mr-2" /> About Us
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-2 hover:bg-red-600 rounded mt-4 text-red-300 hover:text-white transition-colors"
          style={{ outline: 'none', border: 'none', background: 'none', cursor: 'pointer' }}
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentLayout;