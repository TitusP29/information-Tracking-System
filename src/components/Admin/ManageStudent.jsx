import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

export default function ManageStudents() {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [studentID, setStudentID] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [rejectReason, setRejectReason] = useState('');
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

  const handleApprove = (app) => {
    setSelectedApp(app);
    setShowApproveModal(true);
  };

  const handleReject = (app) => {
    setSelectedApp(app);
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    if (!studentID || !studentClass) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // Update the progress_management table
      const { error: updateError } = await supabase
        .from('progress_management')
        .update({ 
          application_review: 'complete',
          student_id: studentID,
          student_class: studentClass
        })
        .eq('student_number', selectedApp.national_id);

      if (updateError) throw updateError;

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === selectedApp.id
            ? { ...app, status: 'complete', studentID, studentClass }
            : app
        )
      );

      setShowApproveModal(false);
      setStudentID('');
      setStudentClass('');
      setSelectedApp(null);
    } catch (err) {
      console.error('Error approving application:', err);
      alert('Failed to approve application. Please try again.');
    }
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      // Update the progress_management table
      const { error: updateError } = await supabase
        .from('progress_management')
        .update({ 
          application_review: 'rejected',
          rejection_reason: rejectReason
        })
        .eq('student_number', selectedApp.national_id);

      if (updateError) throw updateError;

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === selectedApp.id
            ? { ...app, status: 'rejected', reason: rejectReason }
            : app
        )
      );

      setShowRejectModal(false);
      setRejectReason('');
      setSelectedApp(null);
    } catch (err) {
      console.error('Error rejecting application:', err);
      alert('Failed to reject application. Please try again.');
    }
  };

  const filteredApplications = applications.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">Error loading applications: {error}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Pending Applications</h3>
          <div className="space-y-4">
            {filteredApplications
              .filter((a) => a.status === 'pending')
              .map((app) => (
                <div key={app.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{app.name}</h4>
                      <p className="text-gray-600">{app.course}</p>
                    </div>
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Applied: {new Date(app.date).toLocaleDateString()}</p>
                    <p>Student ID: {app.national_id}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(app)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(app)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Approved Students</h3>
          <div className="grid grid-cols-1 gap-6">
            {filteredApplications
              .filter((a) => a.status === 'complete')
              .map((app) => (
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
                    <p>Student ID: {app.studentID || app.national_id}</p>
                    <p>Class: {app.studentClass || 'Not assigned'}</p>
                    <p>Approved on: {new Date(app.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Approve Application</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input
                type="text"
                value={studentID}
                onChange={(e) => setStudentID(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter student ID"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter class"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Reject Application</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 border rounded"
                rows="4"
                placeholder="Enter reason for rejection"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
