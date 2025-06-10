import React, { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';

const RegProgress = () => {
  const [students, setStudents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState('');

  const handleDocumentVerification = async (docType, userId) => {
    if (!userId) return;

    try {
      // Map document types to their corresponding column names
      const columnMap = {
        'id': { uploaded: 'id_uploaded', verified: 'identitydoc' },
        'certificate': { uploaded: 'certificate_uploaded', verified: 'academicrecord' },
        'residence': { uploaded: 'residence_uploaded', verified: 'proofofaddress' },
        'payment': { uploaded: 'payment_uploaded', verified: 'paymentproof' }
      };

      const columns = columnMap[docType];
      if (!columns) return;

      // Update both the uploaded and verified columns
      const { error } = await supabase
        .from('documents')
        .update({
          [columns.uploaded]: true,
          [columns.verified]: true
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Refresh the student data
      await fetchStudents();
      setMessage('Document verified successfully');
    } catch (error) {
      console.error('Error verifying document:', error);
      setMessage('Failed to verify document');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    // Fetch all students with required fields from register table
    const { data, error } = await supabase
      .from('register')
      .select('*')
      .order('reg_date', { ascending: false });
    if (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      return;
    }
    // For each student, fetch their document status from documents table
    const studentsWithStatus = await Promise.all((data || []).map(async (student) => {
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('status')
        .eq('user_id', student.user_id)
        .single();
      return {
        ...student,
        document_status: docData?.status || 'pending',
      };
    }));
    setStudents(studentsWithStatus);
  };

  const handleViewProgress = async (student) => {
    // Fetch the student's document id
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id')
      .eq('user_id', student.user_id)
      .single();
  
    let attachments = [];
  
    if (doc && doc.id) {
      const { data: attData, error: attError } = await supabase
        .from('attachments')
        .select('*')
        .eq('document_id', doc.id);
  
      attachments = await Promise.all(
        (attData || []).map(async (attachment) => {
          const { data } = supabase.storage
            .from('documents')
            .getPublicUrl(attachment.file_path);

          return {
            ...attachment,
            file_url: data?.publicUrl || null,
            file_type: attachment.file_type,
          };
        })
      );
    }
  
    setSelectedStudent({ ...student, attachments });
    setModalOpen(true);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Registration Progress Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Student Number</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Course</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Registration Date</th>
              <th className="py-2 px-4 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 border-b whitespace-nowrap text-sm text-gray-700 align-middle">{student.national_id}</td>
                <td className="px-6 py-3 border-b whitespace-nowrap text-sm font-medium text-gray-900 align-middle">{student.first_name} {student.surname}</td>
                <td className="px-6 py-3 border-b whitespace-nowrap text-sm text-gray-700 align-middle">{student.course}</td>
                <td className="px-6 py-3 border-b whitespace-nowrap text-sm align-middle">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${student.document_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {student.document_status === 'approved' ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-3 border-b whitespace-nowrap text-sm text-gray-700 align-middle">{student.reg_date ? new Date(student.reg_date).toLocaleDateString() : ''}</td>
                <td className="px-6 py-3 border-b whitespace-nowrap text-center align-middle">
                  <button onClick={() => handleViewProgress(student)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center gap-2">
                    View Progress <span className="ml-1">→</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal placeholder - to be implemented next */}
      {modalOpen && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <h3 className="text-2xl font-semibold mb-6">Progress Management - {selectedStudent.first_name} {selectedStudent.surname}</h3>
            <div className="space-y-6">
              {/* Application Submitted Step */}
              <ProgressStep
                label="Application Submitted"
                required
                status={selectedStudent.documents?.application_status || 'complete'}
                lastUpdated={selectedStudent.documents?.application_updated_at || selectedStudent.reg_date}
                onUpdate={async (newStatus) => {
                  await supabase.from('documents').update({ application_status: newStatus, application_updated_at: new Date().toISOString() }).eq('user_id', selectedStudent.user_id);
                  await fetchStudents();
                  setSelectedStudent(s => ({ ...s, documents: { ...s.documents, application_status: newStatus, application_updated_at: new Date().toISOString() } }));
                }}
              />
              {/* Documents Uploaded Step */}
              <ProgressStep
                label="Documents Uploaded"
                required
                status={selectedStudent.documents?.documents_status || 'in_progress'}
                lastUpdated={selectedStudent.documents?.documents_updated_at}
                onUpdate={async (newStatus) => {
                  await supabase.from('documents').update({ documents_status: newStatus, documents_updated_at: new Date().toISOString() }).eq('user_id', selectedStudent.user_id);
                  await fetchStudents();
                  setSelectedStudent(s => ({ ...s, documents: { ...s.documents, documents_status: newStatus, documents_updated_at: new Date().toISOString() } }));
                }}
                showViewDocuments
                attachments={selectedStudent.attachments || []}
              />
              {/* Payment Verified Step */}
              <ProgressStep
                label="Payment Verified"
                required
                status={selectedStudent.documents?.payment_status || 'in_progress'}
                lastUpdated={selectedStudent.documents?.payment_updated_at}
                onUpdate={async (newStatus) => {
                  await supabase.from('documents').update({ payment_status: newStatus, payment_updated_at: new Date().toISOString() }).eq('user_id', selectedStudent.user_id);
                  await fetchStudents();
                  setSelectedStudent(s => ({ ...s, documents: { ...s.documents, payment_status: newStatus, payment_updated_at: new Date().toISOString() } }));
                }}
              />
            </div>
            <button
              className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded shadow"
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function ProgressStep({ label, required, status, lastUpdated, onUpdate, showViewDocuments, attachments }) {
  const [showDocs, setShowDocs] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const REQUIRED_TYPES = ['id', 'certificate', 'residence', 'payment'];

  let statusColor, icon, borderColor, bgColor;
  if (status === 'complete') {
    statusColor = 'bg-green-500';
    icon = <span className="inline-block w-5 h-5 rounded-full bg-green-500 border-2 border-green-700"></span>;
    borderColor = 'border-green-200';
    bgColor = 'bg-green-50';
  } else if (status === 'in_progress') {
    statusColor = 'bg-yellow-400';
    icon = <span className="inline-block w-5 h-5 rounded-full bg-yellow-400 border-2 border-yellow-600"></span>;
    borderColor = 'border-yellow-200';
    bgColor = 'bg-blue-50';
  } else {
    statusColor = 'bg-red-500';
    icon = <span className="inline-block w-5 h-5 rounded-full bg-red-500 border-2 border-red-700 flex items-center justify-center">✖</span>;
    borderColor = 'border-red-200';
    bgColor = 'bg-gray-100';
  }
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${borderColor} ${bgColor}`}>
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <div className="font-semibold text-lg">{label} {required && <span className="text-red-500">*</span>}</div>
          <div className="text-xs text-gray-500">Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Not started'}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className={`px-4 py-1 rounded ${status === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'} font-semibold`}
          onClick={() => onUpdate('complete')}
        >Complete</button>
        <button
          className={`px-4 py-1 rounded ${status === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} font-semibold`}
          onClick={() => onUpdate('in_progress')}
        >In Progress</button>
        {showViewDocuments ? (
          <button
            className={`px-4 py-1 rounded bg-cyan-700 text-white font-semibold`}
            onClick={() => setShowDocs(v => !v)}
          >{showDocs ? 'Hide Documents' : 'View Documents'}</button>
        ) : (
          <button
            className={`px-4 py-1 rounded ${status === 'reset' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-700'} font-semibold`}
            onClick={() => onUpdate('reset')}
          >Reset</button>
        )}
      </div>
      {showViewDocuments && showDocs && (
        <div className="w-full mt-4 bg-gray-50 p-4 rounded shadow-inner">
          <h4 className="font-semibold mb-2">Uploaded Documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {REQUIRED_TYPES.map(type => {
              const doc = attachments.find(a => a.type === type);
              return (
                <div key={type} className="p-2 border rounded bg-white flex flex-col mb-2">
                  <span className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  {doc ? (
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        className="text-blue-600 underline text-left"
                        onClick={() => {
                          setPreviewDoc(doc);
                        }}
                      >View File</button>
                      <button
                        onClick={() => handleDocumentVerification(type, doc.user_id)}
                        className="inline-flex items-center px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded hover:bg-emerald-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Verify
                      </button>
                    </div>
                  ) : (
                    <span className="text-red-500 text-xs mt-1">Not Uploaded</span>
                  )}
                </div>
              );
            })}

            {/* Preview Area */}
            {previewDoc && (
              <div className="col-span-2 mt-4 p-4 border rounded bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Preview: {previewDoc.type.charAt(0).toUpperCase() + previewDoc.type.slice(1)}</span>
                  <button className="text-red-600 font-bold" onClick={() => setPreviewDoc(null)}>Close</button>
                </div>
                {message && (
                  <div className="mb-4 p-3 rounded bg-green-50 text-green-700">
                    {message}
                  </div>
                )}
                {previewDoc.file_type === 'application/pdf' ? (
                  <div className="text-center p-8">
                    <p className="mb-4 text-gray-600">Click the button below to view the PDF in a new tab</p>
                    <div className="flex justify-center gap-4">
                      <a 
                        href={previewDoc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View PDF Document
                      </a>
                      <button
                        onClick={() => handleDocumentVerification(previewDoc.type, previewDoc.user_id)}
                        className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Verify Document
                      </button>
                    </div>
                  </div>
                ) : previewDoc.file_type.startsWith('image/') ? (
                  <div className="text-center">
                    <img src={previewDoc.file_url} alt={previewDoc.type} className="max-h-96 w-auto mx-auto mb-4" />
                    <button
                      onClick={() => handleDocumentVerification(previewDoc.type, previewDoc.user_id)}
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Verify Document
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p className="mb-2">This file type cannot be previewed directly.</p>
                    <div className="flex justify-center gap-4">
                      <a 
                        href={previewDoc.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Download File
                      </a>
                      <button
                        onClick={() => handleDocumentVerification(previewDoc.type, previewDoc.user_id)}
                        className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Verify Document
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default RegProgress;