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
    date: '',
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
      return 'status-completed';
    case 'pending':
      return 'status-pending';
    default:
      return 'status-default';
  }
};

const RegistrationProgress = () => {
  return (
    <div className="registration-progress">
      <div className="header">
        <h2>Registration Progress</h2>
        <button className="back-btn">Back to Dashboard</button>
      </div>

      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`step-card ${step.status === 'Completed' ? 'step-completed' : ''}`}
        >
          <div className="step-number">
            {step.status === 'Completed' ? '✓' : step.id}
          </div>
          <div className="step-content">
            <h3>{step.title}</h3>
            <p>{step.date || '—'}</p>
            <span className={`status-badge ${getStatusClass(step.status)}`}>
              {step.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RegistrationProgress;