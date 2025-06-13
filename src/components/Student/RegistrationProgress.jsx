import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../../supabaseClient';

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'complete':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

const getStepBorder = (status) => {
  if (status === 'complete') return 'border-l-4 border-green-400 bg-green-50';
  if (status === 'in_progress') return 'border-l-4 border-blue-400 bg-blue-50';
  if (status === 'rejected') return 'border-l-4 border-red-400 bg-red-50';
  return 'border-l-4 border-gray-200';
};

const RegistrationProgress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProgressData() {
      try {
        // First get the student's national_id from the register table
        const { data: registerData, error: registerError } = await supabase
          .from('register')
          .select('national_id')
          .eq('user_id', user?.id)
          .single();

        if (registerError) throw registerError;

        if (registerData) {
          // Then fetch the progress data using the national_id
          const { data: progressData, error: progressError } = await supabase
            .from('progress_management')
            .select('*')
            .eq('student_number', registerData.national_id)
            .single();

          if (progressError) throw progressError;
          setProgressData(progressData);
        }
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchProgressData();
    }
  }, [user]);

  const steps = progressData ? [
    {
      id: 1,
      title: 'Application Submitted',
      status: progressData.application_submitted,
      date: progressData.created_at ? new Date(progressData.created_at).toLocaleDateString() : ''
    },
    {
      id: 2,
      title: 'Documents Uploaded',
      status: progressData.document_uploaded,
      date: progressData.updated_at ? new Date(progressData.updated_at).toLocaleDateString() : ''
    },
    {
      id: 3,
      title: 'Payment Verified',
      status: progressData.payment_verified,
      date: progressData.updated_at ? new Date(progressData.updated_at).toLocaleDateString() : ''
    },
    {
      id: 4,
      title: 'Application Review',
      status: progressData.application_review,
      date: progressData.updated_at ? new Date(progressData.updated_at).toLocaleDateString() : ''
    }
  ] : [];

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-6 text-center">
        <p className="text-gray-600">Loading progress data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-6 text-center">
        <p className="text-red-600">Error loading progress data: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6 border-b-2 border-blue-200 pb-2">
        <h2 className="text-2xl font-bold text-gray-700 tracking-tight">Registration Progress</h2>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-100 text-gray-700">Back to Dashboard</button>
      </div>

      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`flex items-center gap-4 mb-6 p-0 ${getStepBorder(step.status)} rounded-lg shadow`}
        >
          {/* Step Number or Check */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
            step.status === 'complete' ? 'bg-green-100 border-green-400 text-green-600' : 
            step.status === 'in_progress' ? 'bg-blue-100 border-blue-400 text-blue-600' :
            'bg-white border-gray-300 text-gray-500'
          }`}>
            {step.status === 'complete' ? (
              <span className="text-green-500 text-2xl">✓</span>
            ) : (
              <span>{step.id}</span>
            )}
          </div>
          {/* Step Content */}
          <div className={`flex-1 bg-slate-800 rounded-lg p-5 ${
            step.status === 'complete' ? 'bg-green-50' : 
            step.status === 'in_progress' ? 'bg-blue-50' :
            ''
          } shadow`}> 
            <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
            <p className="text-gray-300 text-sm mb-2">{step.date || '—'}</p>
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${getStatusClass(step.status)}`}>
              {step.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RegistrationProgress;