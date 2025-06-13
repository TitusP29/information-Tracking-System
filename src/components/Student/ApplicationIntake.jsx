import React, { useState, useEffect } from 'react';
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const ApplicationIntake = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [studentApplications, setStudentApplications] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('name, duration, status, mode, description');

        if (coursesError) throw coursesError;
        setCourses(coursesData);

        // If user is logged in, fetch their applications
        if (user?.id) {
          const { data: registerData, error: registerError } = await supabase
            .from('register')
            .select('course, national_id')
            .eq('user_id', user.id);

          if (registerError) throw registerError;

          if (registerData && registerData.length > 0) {
            // For each registration, fetch the progress
            const applications = {};
            for (const registration of registerData) {
              const { data: progressData, error: progressError } = await supabase
                .from('progress_management')
                .select('application_review')
                .eq('student_number', registration.national_id)
                .single();

              if (progressError) throw progressError;

              applications[registration.course] = {
                status: progressData?.application_review || 'pending'
              };
            }
            setStudentApplications(applications);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleApply = (courseName) => {
    navigate('/register', { state: { courseName } });
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  const handleCloseDetails = () => {
    setShowCourseDetails(false);
    setSelectedCourse(null);
  };

  const getButtonState = (course) => {
    // If course is closed, show disabled button
    if (course.status !== 'Open') {
      return {
        text: 'Applications Closed',
        disabled: true,
        className: 'w-full bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed opacity-50'
      };
    }

    // Check if student has applied for this course
    const application = studentApplications[course.name];
    if (application) {
      if (application.status === 'complete') {
        return {
          text: 'Enrolled',
          disabled: true,
          className: 'w-full bg-green-600 text-white font-bold py-2 px-4 rounded cursor-not-allowed'
        };
      } else if (application.status === 'rejected') {
        return {
          text: 'Application Rejected',
          disabled: true,
          className: 'w-full bg-red-600 text-white font-bold py-2 px-4 rounded cursor-not-allowed'
        };
      } else {
        return {
          text: 'Application in Progress',
          disabled: true,
          className: 'w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded cursor-not-allowed'
        };
      }
    }

    // If no application exists, show apply button
    return {
      text: 'Apply Now',
      disabled: false,
      className: 'w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out'
    };
  };

  if (loading) {
    return <div className="flex-1 p-6">Loading courses...</div>;
  }

  if (courses.length === 0) {
    return <div className="flex-1 p-6">No courses available at the moment.</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Courses</h1>
        <button className="bg-red-500 text-white px-4 py-2 rounded flex items-center">
          <FaSignOutAlt className="mr-1" /> Logout
        </button>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => {
          const buttonState = getButtonState(course);
          return (
            <div key={course.name} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-2">{course.name}</h3>
                <div className="flex justify-end -mt-8 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    course.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {course.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-1"><span className="font-semibold">Duration:</span> {course.duration}</p>
                <p className="text-gray-600 text-sm mb-1"><span className="font-semibold">Mode:</span> {course.mode}</p>
                <p className="text-gray-600 text-sm mb-4"><span className="font-semibold">Description:</span> {course.description}</p>
              </div>
              
              <div className="mt-auto">
                <button
                  onClick={() => !buttonState.disabled && handleApply(course.name)}
                  disabled={buttonState.disabled}
                  className={buttonState.className}
                >
                  {buttonState.text}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Details Modal */}
      {showCourseDetails && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">{selectedCourse.name}</h2>
            <p className="mb-2"><span className="font-semibold">Duration:</span> {selectedCourse.duration}</p>
            <p className="mb-2"><span className="font-semibold">Mode:</span> {selectedCourse.mode}</p>
            <p className="mb-4"><span className="font-semibold">Status:</span> {selectedCourse.status}</p>
            <p className="mb-6"><strong>Description:</strong> {selectedCourse.description}</p>
            <button 
              onClick={handleCloseDetails}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplicationIntake;
