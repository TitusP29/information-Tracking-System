import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

export default function ManageStudents() {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // Fetch all students with their progress data
      const { data: registerData, error: registerError } = await supabase
        .from('register')
        .select('*')
        .order('reg_date', { ascending: false });

      if (registerError) throw registerError;

      // For each student, fetch their progress
      const applicationsWithProgress = await Promise.all(
        (registerData || []).map(async (student) => {
          const { data: progressData, error: progressError } = await supabase
            .from('progress_management')
            .select('*')
            .eq('student_number', student.national_id)
            .single();

          if (progressError) throw progressError;

          return {
            id: student.id,
            name: `${student.first_name} ${student.surname}`,
            course: student.course,
            date: student.reg_date,
            national_id: student.national_id,
            status: progressData?.application_review || 'pending',
            progress: progressData
          };
        })
      );

      setApplications(applicationsWithProgress);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    (app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.course.toLowerCase().includes(searchTerm.toLowerCase())) &&
    app.status === 'complete'
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">Error loading students: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or course..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Approved Students</h3>
        <div className="space-y-4">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{app.name}</h4>
                    <p className="text-gray-600">{app.course}</p>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                    Approved
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Student ID: {app.national_id}</p>
                  <p>Approved on: {new Date(app.date).toLocaleDateString()}</p>
                  {app.progress?.student_class && (
                    <p>Class: {app.progress.student_class}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No approved students</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no approved students in the system yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
