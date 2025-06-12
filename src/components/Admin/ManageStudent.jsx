import React, { useState } from 'react';

const sampleApplications = [
  {
    id: 'app-001',
    name: 'John Doe',
    course: 'Computer Science',
    date: '2025-06-01',
  
    paid: false,
    status: 'pending',
  },
  {
    id: 'app-002',
    name: 'Jane Smith',
    course: 'Business Admin',
    date: '2025-06-05',
   
    paid: true,
    status: 'pending',
  },
];

export default function ManageStudents() {
  const [applications, setApplications] = useState(sampleApplications);
  const [searchTerm, setSearchTerm] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [studentID, setStudentID] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = (app) => {
    setSelectedApp(app);
    setShowApproveModal(true);
  };

  const handleReject = (app) => {
    setSelectedApp(app);
    setShowRejectModal(true);
  };

  const confirmApprove = () => {
    if (!studentID || !studentClass) {
      alert('Please fill in all fields');
      return;
    }

    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApp.id
          ? { ...app, studentID, studentClass, status: 'approved' }
          : app
      )
    );

    setShowApproveModal(false);
    setStudentID('');
    setStudentClass('');
    setSelectedApp(null);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApp.id
          ? { ...app, reason: rejectReason, status: 'rejected' }
          : app
      )
    );

    setShowRejectModal(false);
    setRejectReason('');
    setSelectedApp(null);
  };

  const filteredApps = applications.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Pending Applications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredApps
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
                  
                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-gray-600">
                      Applied: {new Date(app.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Application Fee:{' '}
                      <span className={app.paid ? 'text-green-600' : 'text-red-600'}>
                        {app.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </p>
                  </div>

                  {showApproveModal && selectedApp?.id === app.id ? (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3">Approve Student</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for Approval
                          </label>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setApprovedReason(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows="3"
                            placeholder="Enter reason for approval..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={confirmApprove}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setShowApproveModal(false);
                              setSelectedApp(null);
                            }}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : showRejectModal && selectedApp?.id === app.id ? (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3">Reject Application</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for Rejection
                          </label>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows="3"
                            placeholder="Enter reason for rejection..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={confirmReject}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setShowRejectModal(false);
                              setRejectReason('');
                              setSelectedApp(null);
                            }}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Approved Students</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications
              .filter((a) => a.status === 'approved')
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

                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-gray-600">
                      Student ID: <span className="font-medium">{app.studentID}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Class: <span className="font-medium">{app.studentClass}</span>
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setApplications((prev) =>
                        prev.map((x) =>
                          x.id === app.id ? { ...x, status: 'pending' } : x
                        )
                      )
                    }
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Revert Acceptance
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
