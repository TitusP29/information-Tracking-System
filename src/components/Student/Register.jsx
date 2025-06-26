import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../../supabaseClient';

const RegistrationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    national_id: '',
    surname: '',
    first_name: '',
    title: '',
    dob: '',
    home_address: '',
    home_phone: '',
    postal_address: '',
    cell_phone: '',
    email: '',
    kin_name: '',
    kin_cell: '',
    course: '',
    disability: '',
    reg_date: ''
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        let autofill = {};
        if (user && user.id) {
          const { data, error } = await supabase
            .from('user_profile')
            .select('first_name, surname')
            .eq('id', user.id)
            .single();
          if (error) {
            console.error('Profile fetch error:', error);
          }
          if (data) {
            autofill = {
              first_name: data.first_name || '',
              surname: data.surname || '',
            };
          }
        }
        // Always set email from user object
        if (user && user.email) {
          autofill.email = user.email;
        }
        // Ensure course is autofilled from navigation state if present
        if (location.state && location.state.courseName) {
          autofill.course = location.state.courseName;
        }
        // Autofill registration date to today if not already set
        if (!formData.reg_date) {
          const today = new Date();
          autofill.reg_date = today.toISOString().split('T')[0];
        }
        setFormData(prev => ({ ...prev, ...autofill }));
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    }
    if (user && user.id) {
      fetchProfile();
    }
  }, [user, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Check if student already has a registration with this national_id
      const { data: existingRegistrations, error: checkError } = await supabase
        .from('register')
        .select('national_id')
        .eq('national_id', formData.national_id);

      if (checkError) throw checkError;

      // If this is the first registration, use the provided national_id
      // Otherwise, generate a new unique national_id by appending a suffix
      let nationalId = formData.national_id;
      if (existingRegistrations && existingRegistrations.length > 0) {
        const timestamp = new Date().getTime();
        nationalId = `${formData.national_id}_${timestamp}`;
      }

      // Compose registration data
      const registration = {
        ...formData,
        national_id: nationalId,
        user_id: user?.id,
        reg_date: formData.reg_date === '' ? null : formData.reg_date,
        dob: formData.dob === '' ? null : formData.dob,
      };

      // Insert into Supabase
      const { error: regError } = await supabase.from('register').insert([registration]);
      if (regError) throw regError;

      // Add student to progress_management table
      const progressManagementData = {
        student_number: nationalId,
        application_submitted: 'pending',
        document_uploaded: 'pending',
        payment_verified: 'pending',
        application_review: 'pending'
      };

      const { error: progressError } = await supabase
        .from('progress_management')
        .insert([progressManagementData]);

      if (progressError) throw progressError;

      // Create notification for admin about new application
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          type: 'info',
          title: 'New Student Application',
          message: `New application received from ${formData.first_name} ${formData.surname} for ${formData.course}`,
          recipient_id: 'admin', // This will be sent to all admins
          read: false
        }]);

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      setSuccess('Registration submitted successfully!');
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/student');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed.');
      console.error('Registration failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="max-w-5xl mx-auto p-8 bg-white rounded shadow" onSubmit={handleSubmit}>
      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {success && <div className="mb-4 text-green-600 font-semibold">{success}</div>}
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Fee Structure Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-medium">Registration Fee:</span>
              <span className="text-gray-700">R2,799.84</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-medium">Skills Programme Fee:</span>
              <span className="text-gray-700">R5,598.72</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-medium">Assessment & Moderation:</span>
              <span className="text-gray-700">R300 each (PoE, Internal, External)</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-medium">Certification:</span>
              <span className="text-gray-700">R125.04</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-medium">Statement of Results:</span>
              <span className="text-gray-700">R125.04</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-medium">Final Assessment:</span>
              <span className="text-gray-700">R936.00</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-medium">PPE:</span>
              <span className="text-gray-700">To be determined</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-medium">Optional Extras:</span>
              <span className="text-gray-700">To be determined</span>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-600 font-medium">
            IMPORTANT: Kindly upload a certified copy of your ID, Proof of Resident and Latest Certificates, when submitting your Application.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} placeholder="National ID No" className="border rounded px-3 py-2" required />
        <input type="text" name="surname" value={formData.surname} onChange={handleChange} placeholder="Surname" className="border rounded px-3 py-2" required />
        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First name" className="border rounded px-3 py-2" required />
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="border rounded px-3 py-2" required />
        <input type="date" name="dob" value={formData.dob} onChange={handleChange} placeholder="yyyy/mm/dd" className="border rounded px-3 py-2" required />
        <input type="text" name="home_address" value={formData.home_address} onChange={handleChange} placeholder="Home address" className="border rounded px-3 py-2" required />
        <input type="text" name="home_phone" value={formData.home_phone} onChange={handleChange} placeholder="Home phone number" className="border rounded px-3 py-2" required />
        <input type="text" name="postal_address" value={formData.postal_address} onChange={handleChange} placeholder="Postal address" className="border rounded px-3 py-2" required />
        <input type="text" name="cell_phone" value={formData.cell_phone} onChange={handleChange} placeholder="Cell phone number" className="border rounded px-3 py-2" required />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email address" className="border rounded px-3 py-2" required />
        <input type="text" name="kin_name" value={formData.kin_name} onChange={handleChange} placeholder="Next of kin name" className="border rounded px-3 py-2" required />
        <input type="text" name="kin_cell" value={formData.kin_cell} onChange={handleChange} placeholder="Next of kin cell number" className="border rounded px-3 py-2" required />
        <input type="text" name="course" value={formData.course} onChange={handleChange} placeholder="Course" className="border rounded px-3 py-2" required readOnly />
      </div>
      <textarea name="disability" value={formData.disability} onChange={handleChange} placeholder="Specify disability if applicable" className="border rounded px-3 py-2 w-full mb-4" rows={2} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Date:</label>
          <input type="date" name="reg_date" value={formData.reg_date} onChange={handleChange} className="border rounded px-3 py-2" required />
        </div>
      </div>
      <button 
        type="submit" 
        className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition"
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default RegistrationForm;
