import React from "react";

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

const EnrolledStudentsTable = () => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3">Student ID</th>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Date of Birth</th>
            <th className="px-6 py-3">Course</th>
            <th className="px-6 py-3">Enrollment Status</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4">{student.id}</td>
              <td className="px-6 py-4">{student.name}</td>
              <td className="px-6 py-4">{student.dob}</td>
              <td className="px-6 py-4">{student.course}</td>
              <td className="px-6 py-4">
                <StatusBadge status={student.status} />
              </td>
              <td className="px-6 py-4">
                <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EnrolledStudentsTable; 