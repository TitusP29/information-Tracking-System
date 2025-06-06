import React, { useState } from 'react';

const GasRegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    email: '',
    phone: '',
    course: ''
  });

  const [status, setStatus] = useState('pending');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Registration submitted successfully!');
  };

  return (
    <div className="gas-registration-container">
      <div className="gas-registration-header">
        <h2>Gas Registration</h2>
        <div className="header-controls">
          <button className="back-btn">Back</button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="registration-info">
        Please fill in the form below to complete your gas registration.
      </div>

      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="course"
            placeholder="Selected Course"
            value={formData.course}
            onChange={handleChange}
            required
          />
        </div>
          
        <button className="submit-btn" type="submit">
          Submit Registration
        </button>
      </form>

      <div className="fees-section">
        <h2>Fees Breakdown</h2>
        <table className="fees-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Registration Fee</td>
              <td>$50</td>
            </tr>
            <tr>
              <td>Course Material</td>
              <td>$30</td>
            </tr>
            <tr>
              <td>Safety Equipment</td>
              <td>$20</td>
            </tr>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>$100</strong></td>
            </tr>
          </tbody>
        </table>

        <div className="payment-info">
          <h3>Payment Instructions</h3>
          <ul>
            <li>Transfer the fee to account number: 123456789</li>
            <li>Bank: ABC Bank</li>
            <li>Use your full name as the payment reference</li>
          </ul>
          <p>
            For any inquiries, contact us at <a href="mailto:support@gasportal.com">support@gasportal.com</a>
          </p>
        </div>
      </div>

      <div className="selected-course-info">
        <h3>Selected Course Details</h3>
        <div className="course-details">
          <p><strong>Course Name:</strong> {formData.course || 'N/A'}</p>
          <p><strong>Status:</strong> <span className={`status-badge ${status}`}>{status}</span></p>
        </div>
      </div>
    </div>
  );
};

export default GasRegistrationForm;
