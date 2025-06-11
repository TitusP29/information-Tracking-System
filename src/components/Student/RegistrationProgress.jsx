import React from 'react';

const steps = [
  {
    id: 1,
    title: 'Application Submitted',
    date: '',
    status: 'Pending'
  },
  {
    id: 2,
    title: 'Documents Uploaded',
    date: '31/05/2025',
    status: 'Completed'
  },
  {
    id: 3,
    title: 'Payment Processed',
    date: '',
    status: 'Pending'
  },
  {
    id: 4,
    title: 'Application Review',
    date: '',
    status: 'Pending'
  },
  {
    id: 5,
    title: 'Registration Completed',
    date: '',
    status: 'Pending'
  }
];

const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

const getStepBorder = (status) => {
  if (status === 'Completed') return 'border-l-4 border-green-400 bg-green-50';
  if (status === 'Pending') return 'border-l-4 border-gray-200';
  return 'border-l-4 border-gray-200';
};

const RegistrationProgress = () => {
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
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 ${step.status === 'Completed' ? 'bg-green-100 border-green-400 text-green-600' : 'bg-white border-gray-300 text-gray-500'}`}>
            {step.status === 'Completed' ? (
              <span className="text-green-500 text-2xl">✓</span>
            ) : (
              <span>{step.id}</span>
            )}
          </div>
          {/* Step Content */}
          <div className={`flex-1 bg-slate-800 rounded-lg p-5 ${step.status === 'Completed' ? 'bg-green-50' : ''} shadow`}> 
            <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
            <p className="text-gray-300 text-sm mb-2">{step.date || '—'}</p>
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${getStatusClass(step.status)}`}>
              {step.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RegistrationProgress;