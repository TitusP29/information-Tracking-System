import React, { useState } from "react";

const initialAttendance = [
  { 
    id: "CS/24/001", 
    name: "John Doe", 
    course: "Software Development",
    status: "Present",
    attendanceType: "Physical" 
  },
  { 
    id: "EE/23/045", 
    name: "Mary Johnson", 
    course: "Web Development",
    status: "Absent",
    attendanceType: "Virtual" 
  },
  { 
    id: "ME/24/008", 
    name: "Michael Smith", 
    course: "Software Development",
    status: "Late",
    attendanceType: "Physical" 
  },
  { 
    id: "CE/23/032", 
    name: "Emily Brown", 
    course: "Web Development",
    status: "Present",
    attendanceType: "Virtual" 
  },
];

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState(initialAttendance);
  const [selectedCourse, setSelectedCourse] = useState("All");

  const courses = ["All", "Software Development", "Web Development"];

  const updateAttendance = (index, newStatus, newType) => {
    const updated = [...attendanceData];
    if (newStatus) updated[index].status = newStatus;
    if (newType) updated[index].attendanceType = newType;
    setAttendanceData(updated);
  };

  const filteredAttendance = selectedCourse === "All" 
    ? attendanceData 
    : attendanceData.filter(student => student.course === selectedCourse);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Student Attendance</h1>
          <div className="flex items-center gap-4">
            <label className="font-medium">Filter by Course:</label>
            <select 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border rounded px-3 py-1"
            >
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="p-3">Student ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Course</th>
                <th className="p-3">Status</th>
                <th className="p-3">Attendance Type</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((student, index) => (
                <tr
                  key={student.id}
                  className="border-b hover:bg-gray-50 transition-all"
                >
                  <td className="p-3">{student.id}</td>
                  <td className="p-3">{student.name}</td>
                  <td className="p-3">{student.course}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        student.status === "Present"
                          ? "bg-green-500"
                          : student.status === "Absent"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm
                      ${student.attendanceType === "Physical" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-purple-100 text-purple-800"}`}
                    >
                      {student.attendanceType}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateAttendance(index, "Present")}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => updateAttendance(index, "Absent")}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => updateAttendance(index, "Late")}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Late
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateAttendance(index, null, "Physical")}
                          className={`px-3 py-1 rounded ${
                            student.attendanceType === "Physical"
                              ? "bg-blue-500 text-white"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          Physical
                        </button>
                        <button
                          onClick={() => updateAttendance(index, null, "Virtual")}
                          className={`px-3 py-1 rounded ${
                            student.attendanceType === "Virtual"
                              ? "bg-purple-500 text-white"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          Virtual
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
