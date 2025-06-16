import React, { useState } from 'react';

const Notifications = () => {
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Mock data for notifications
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Application Approved',
      message: 'Student application for John Doe has been approved',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Document Update Required',
      message: 'Please update the student ID document for Jane Smith',
      time: '5 hours ago',
      read: true
    },
    {
      id: 3,
      type: 'info',
      title: 'New Application Received',
      message: 'New student application from Mike Johnson',
      time: '1 day ago',
      read: false
    },
    {
      id: 4,
      type: 'error',
      title: 'System Maintenance',
      message: 'System will be under maintenance tonight at 10 PM',
      time: '2 days ago',
      read: true
    }
  ];

  // Mock data for students
  const students = [
    { id: 1, name: 'John Doe', course: 'Computer Science' },
    { id: 2, name: 'Jane Smith', course: 'Business Administration' },
    { id: 3, name: 'Mike Johnson', course: 'Engineering' },
    { id: 4, name: 'Sarah Williams', course: 'Medicine' }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowMessageForm(!showMessageForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showMessageForm ? 'Cancel' : 'Send Message'}
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Mark all as read</span>
          </button>
          <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Clear all</span>
          </button>
        </div>
      </div>

      {showMessageForm && (
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Send Message to Students</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Students
              </label>
              <div className="grid grid-cols-2 gap-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`student-${student.id}`}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <label htmlFor={`student-${student.id}`} className="text-sm text-gray-700">
                      {student.name} - {student.course}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Subject
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter message subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Content
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Type your message here..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowMessageForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 ${
              !notification.read ? 'hover:shadow-md' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              {getNotificationIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <div className="flex-shrink-0">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
          <p className="mt-1 text-sm text-gray-500">
            You're all caught up! Check back later for new notifications.
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;