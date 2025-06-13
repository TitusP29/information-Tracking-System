import React, { useState, useEffect } from "react";
import { FaUserCircle, FaGraduationCap, FaFileAlt, FaBell, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from '../../../supabaseClient';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [applications, setApplications] = useState([]);
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
