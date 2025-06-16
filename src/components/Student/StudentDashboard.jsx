import React, { useState, useEffect } from "react";
import { FaUserCircle, FaGraduationCap, FaFileAlt, FaBell, FaSignOutAlt, FaCheck, FaTimes } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from '../../../supabaseClient';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStudentData() {
      try {
        // First get the student's data from the register table
        const { data: registerData, error: registerError } = await supabase
          .from('register')
          .select('*')
          .eq('user_id', user?.id)
          .order('reg_date', { ascending: false });

        if (registerError) throw registerError;

        if (registerData && registerData.length > 0) {
          // Get the most recent registration for profile data
          const latestRegistration = registerData[0];
          
          // Fetch progress data for all applications
          const applicationsWithProgress = await Promise.all(
            registerData.map(async (registration) => {
              const { data: progressData, error: progressError } = await supabase
                .from('progress_management')
                .select('*')
                .eq('student_number', registration.national_id)
                .single();

              if (progressError) throw progressError;

              return {
                ...registration,
                progress: progressData
              };
            })
          );

          setStudentData(latestRegistration);
          setApplications(applicationsWithProgress);
        }

        // Fetch notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', user?.id)
          .order('created_at', { ascending: false });

        if (notificationsError) throw notificationsError;
        setNotifications(notificationsData || []);

        // Fetch documents
        const { data: docsData, error: docsError } = await supabase
          .from('documents')
          .select('*, attachments(*)')
          .eq('user_id', user?.id);

        if (docsError) throw docsError;
        setDocuments(docsData?.[0] || null);

      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchStudentData();
    }
  }, [user]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>;
      case 'warning':
        return <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>;
      case 'error':
        return <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>;
    }
  };

  const getDocumentStatus = (docType) => {
    if (!documents) return false;
    return documents[`${docType}_uploaded`];
  };

  const getMissingDocuments = () => {
    const requiredDocs = ['id', 'certificate', 'residence', 'payment'];
    return requiredDocs.filter(doc => !getDocumentStatus(doc));
  };

  const getDocumentLabel = (docType) => {
    const labels = {
      id: 'ID Document',
      certificate: 'Latest Certificate',
      residence: 'Proof of Residence',
      payment: 'Proof of Payment'
    };
    return labels[docType] || docType;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Loading student data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">Error loading student data: {error}</p>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">No student data found. Please complete your registration.</p>
      </div>
    );
  }

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
            <p className="font-semibold text-lg">{studentData.first_name} {studentData.surname}</p>
            <p className="text-gray-600">{studentData.email}</p>
          </div>
          <p><span className="font-semibold">Student Number:</span> {studentData.national_id}</p>
          <p><span className="font-semibold">Total Applications:</span> {applications.length}</p>
        </div>

        {/* Applications Card */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
            <FaGraduationCap className="mr-2" /> My Applications
          </h2>
          <div className="space-y-4">
            {applications.map((application, index) => (
              <div key={index} className="border rounded p-4 bg-gray-50">
                <p className="font-semibold">{application.course}</p>
                <p><span className="font-semibold">Status:</span> <span className={`px-3 py-1 rounded-full text-sm ${
                  application.progress?.application_review === 'complete' ? 'bg-green-100 text-green-700' :
                  application.progress?.application_review === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {application.progress?.application_review === 'complete' ? 'Approved' :
                   application.progress?.application_review === 'rejected' ? 'Rejected' : 'Pending'}
                </span></p>
                <p><span className="font-semibold">Applied:</span> {new Date(application.reg_date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center mb-4">
            <FaFileAlt className="text-3xl text-yellow-500 mr-4" />
            <p className="text-lg font-semibold">Documents</p>
          </div>
          {documents ? (
            getMissingDocuments().length === 0 ? (
              <div className="flex items-center text-green-600">
                <FaCheck className="mr-2" />
                <p>All required documents have been uploaded</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Missing documents:</p>
                <ul className="space-y-1">
                  {getMissingDocuments().map(doc => (
                    <li key={doc} className="flex items-center text-red-600">
                      <FaTimes className="mr-2" />
                      <span>{getDocumentLabel(doc)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : (
            <p className="text-gray-600">No document information available</p>
          )}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center mb-2">
            <FaBell className="text-3xl text-purple-500 mr-4" />
            <p className="text-lg font-semibold">Notifications</p>
          </div>
          <div className="space-y-2">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No notifications</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
