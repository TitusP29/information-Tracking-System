import React, { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { FaEye } from 'react-icons/fa';

const ViewReg = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusMap, setStatusMap] = useState({}); // { studentId: 'pending' | 'approved' }

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase.from('register').select('*');
    if (error) {
      console.error('Error fetching students:', error);
    } else {
      setStudents(data);
      // Initialize statusMap with 'pending' for each student
      const initialStatus = {};
      data.forEach(s => { initialStatus[s.id] = 'pending'; });
      setStatusMap(initialStatus);
    }
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleApprove = (studentId) => {
    setStatusMap(prev => ({ ...prev, [studentId]: 'approved' }));
    setModalOpen(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Student Registrations</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Course</th>
              <th className="py-2 px-4 border-b">Registration Date</th>
              <th className="py-2 px-4 border-b">Application Status</th>
              <th className="py-2 px-4 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-9 py-2 border-b whitespace-nowrap text-sm font-medium text-gray-900 align-middle">{student.first_name}</td>
                <td className="px-9 py-2 border-b whitespace-nowrap text-sm text-gray-700 align-middle">{student.course || student.course_name}</td>
                <td className="px-9 py-2 border-b whitespace-nowrap text-sm text-gray-700 align-middle">{student.reg_date ? new Date(student.reg_date).toLocaleDateString() : ''}</td>
                <td className="px-9 py-2 border-b whitespace-nowrap text-sm align-middle">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${student.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{student.status || 'pending'}</span>
                </td>
                <td className="px-6 py-3 border-b whitespace-nowrap text-center align-middle">
                  <button onClick={() => handleView(student)} className="text-blue-600 hover:text-blue-800">
                    <FaEye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-4">Student Details</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {Object.entries(selectedStudent)
                .filter(([key]) => key !== 'id' && key !== 'user_id')
                .map(([key, value]) => (
                  <div key={key}>
                    <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span> {key.includes('date') && value ? new Date(value).toLocaleDateString() : String(value)}
                  </div>
                ))}
            </div>
            <button
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded shadow"
              onClick={async () => {
                await supabase.from('register').update({ status: 'approved' }).eq('id', selectedStudent.id);
                setStudents(students => students.map(s => s.id === selectedStudent.id ? { ...s, status: 'approved' } : s));
                setModalOpen(false);
              }}
            >
              Approve Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewReg;
