import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialForm = {
  name: '',
  duration: '',
  mode: 'Full-time',
  level: 'Beginner',
  description: '',
  status: 'Open',
  opening_date: '',
  closing_date: '',
};

const ManageCourse = () => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase.from('courses').select('*').order('id', { ascending: false });
    if (!error) setCourses(data || []);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from('courses').insert([form]).select();
    setLoading(false);
    if (error) {
      toast.error('Failed to create course: ' + error.message);
    } else {
      toast.success('Course created successfully!');
      setCourses([data[0], ...courses]);
      setShowModal(false);
      setForm(initialForm);
    }
  };

  return (
    <div className="p-4">
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
        onClick={() => setShowModal(true)}
      >
        + Create Course
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative border border-gray-200">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >&#10005;</button>
            <h2 className="text-2xl font-bold mb-6 text-center">Create New Course</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  id="duration"
                  type="text"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 3 months"
                  className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                <select
                  id="mode"
                  name="mode"
                  value={form.mode}
                  onChange={handleChange}
                  className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  id="level"
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Course Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Dates</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="opening_date" className="block text-xs text-gray-500 mb-1">Opening Date</label>
                    <input
                      id="opening_date"
                      type="date"
                      name="opening_date"
                      value={form.opening_date}
                      onChange={handleChange}
                      className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="closing_date" className="block text-xs text-gray-500 mb-1">Closing Date</label>
                    <input
                      id="closing_date"
                      type="date"
                      name="closing_date"
                      value={form.closing_date}
                      onChange={handleChange}
                      className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 w-full font-semibold transition"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {courses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onStatusChange={async (newStatus) => {
              // Update course status
              const { error } = await supabase.from('courses').update({ status: newStatus }).eq('id', course.id);
              if (error) {
                toast.error('Failed to update status: ' + error.message);
                return;
              }
              // Insert status history
              const admin = 'Admin'; // Replace with real admin if available
              const action = newStatus === 'Open' ? 'Reopened' : 'Closed';
              const note = `The application has been ${action.toLowerCase()}`;
              const date = new Date().toISOString().split('T')[0];
              await supabase.from('status_history').insert([
                {
                  course_id: course.id,
                  date,
                  action: action,
                  admin,
                  note
                }
              ]);
              toast.success(`Course ${action.toLowerCase()} successfully!`);
              fetchCourses();
            }}
          />
        ))}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

// --- CourseCard Component ---

function formatDate(dateStr) {
  if (!dateStr) return 'Invalid Date';
  const d = new Date(dateStr);
  if (isNaN(d)) return 'Invalid Date';
  return d.toLocaleDateString();
}

const CourseCard = ({ course, onStatusChange }) => {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [course.id, course.status]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('status_history')
      .select('*')
      .eq('course_id', course.id)
      .order('date', { ascending: false });
    setHistory(data || []);
  };

  const isClosed = course.status === 'Closed';
  const badgeClass = isClosed
    ? 'bg-red-100 text-red-800 border border-red-200'
    : 'bg-green-100 text-green-800 border border-green-200';
  const badgeText = isClosed ? 'Closed' : 'Open';
  const badgeDate = isClosed ? course.closing_date : course.opening_date;

  return (
    <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-6 w-full max-w-md transform transition duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold">{course.name}</h3>
        <div className={`rounded px-4 py-2 text-center text-sm font-semibold ${badgeClass}`} style={{minWidth:100}}>
          {badgeText}<br/>
          <span className="font-normal italic text-xs">Since<br/>{formatDate(badgeDate)}</span>
        </div>
      </div>
      <div className="space-y-1 text-lg text-gray-700">
      <p><span className="font-medium">Duration:</span>  {course.duration}</p>
        <p><span className="font-medium">Level:</span> {course.level}</p>
        <p><span className="font-medium">Mode: </span> {course.mode}</p>
        <p><span className="font-medium">Last Opened:</span>{formatDate(course.opening_date)}</p>
        <p><span className="font-medium">Closed Since:</span> {formatDate(course.closing_date)}</p>
      </div>
      <div className="mb-2">
        <b>Status History:</b>
        <div className="bg-gray-50 border rounded p-2 text-xs mt-1">
          {history.length === 0 && <div>No history available.</div>}
          {history.map((h, idx) => (
            <div key={h.id || idx} className="mb-1">
              {formatDate(h.date)} - {h.action} by {h.admin}: <i>{h.note}</i>
            </div>
          ))}
        </div>
      </div>
      <button
        className={`mt-auto px-4 py-2 rounded w-full ${isClosed ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200' : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'} font-semibold`}
        onClick={() => onStatusChange(isClosed ? 'Open' : 'Closed')}
      >
        {isClosed ? 'Reopen Applications' : 'Close Applications'}
      </button>
    </div>
  );
};

export default ManageCourse;