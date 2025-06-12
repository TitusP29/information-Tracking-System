import React from "react";
import { FaUserCircle, FaGraduationCap, FaFileAlt, FaBell, FaSignOutAlt } from "react-icons/fa";

export default function StudentDashboard() {
  const student = {
    name: "Mapula Mabunda",
    email: "mapula@gmail.com",
    course: "Energy Efficiency Technician",
    status: "Pre-Approved",
    applicationDate: "31/05/2025",
    studentNumber: "GAS-2025-1309",
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
      </div>

      {/* Profile and Application Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Profile Card */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
            <FaUserCircle className="mr-2" /> Student Profile
          </h2>
          <div className="text-center mb-4">
            <div className="text-4xl text-blue-500 mx-auto mb-2">
              <FaUserCircle />
            </div>
            <p className="font-semibold text-lg">{student.name}</p>
            <p className="text-gray-600">{student.email}</p>
          </div>
          <p><span className="font-semibold">Course:</span> {student.course}</p>
          <p><span className="font-semibold">Status:</span> <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{student.status}</span></p>
          <p><span className="font-semibold">Application Date:</span> {student.applicationDate}</p>
        </div>

        {/* Application Card */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
            <FaGraduationCap className="mr-2" /> My Applications
          </h2>
          <div className="border rounded p-4 bg-gray-50">
            <p className="font-semibold">{student.course}</p>
            <p><span className="font-semibold">Status:</span> <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{student.status}</span></p>
            <p><span className="font-semibold">Applied:</span> {student.applicationDate}</p>
            <p><span className="font-semibold">Student Number:</span> {student.studentNumber}</p>
          </div>
        </div>
      </div>

      {/* Additional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow flex items-center">
          <FaFileAlt className="text-3xl text-yellow-500 mr-4" />
          <p className="text-lg font-semibold">Documents</p>
        </div>
        <div className="bg-white p-4 rounded shadow flex items-center">
          <FaBell className="text-3xl text-purple-500 mr-4" />
          <p className="text-lg font-semibold">Notifications</p>
        </div>
      </div>
    </>
  );
}
