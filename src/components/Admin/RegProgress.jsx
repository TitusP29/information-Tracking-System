import React, { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { toast, Toaster } from 'react-hot-toast';

const PDFViewer = ({ fileUrl }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  
  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <Viewer
        fileUrl={fileUrl}
        plugins={[defaultLayoutPluginInstance]}
        defaultScale={1}
      />
    </Worker>
  );
};

const RegProgress = () => {
  const [students, setStudents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

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
    // For each student, fetch their progress from progress_management table
    const studentsWithProgress = await Promise.all((data || []).map(async (student) => {
      const { data: progressData, error: progressError } = await supabase
        .from('progress_management')
        .select('*')
        .eq('student_number', student.national_id)
        .single();
      
      // If no progress record exists, create one
      if (!progressData && !progressError) {
        const { data: newProgress, error: createError } = await supabase
          .from('progress_management')
          .insert({
            student_number: student.national_id,
            application_submitted: 'pending',
            document_uploaded: 'pending',
            payment_verified: 'pending',
            application_review: 'pending'
          })
          .select()
          .single();
        
        return {
          ...student,
          progress: newProgress || {
            application_submitted: 'pending',
            document_uploaded: 'pending',
            payment_verified: 'pending',
            application_review: 'pending'
          }
        };
      }

      return {
        ...student,
        progress: progressData || {
          application_submitted: 'pending',
          document_uploaded: 'pending',
          payment_verified: 'pending',
          application_review: 'pending'
        }
      };
    }));
    setStudents(studentsWithProgress);
  };

  const updateProgress = async (studentNumber, field, status) => {
    try {
      // Define valid statuses based on the field
      const validStatuses = field === 'application_review' 
        ? ['pending', 'in_progress', 'approved', 'rejected']
        : ['pending', 'in_progress', 'complete', 'rejected'];

      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. For ${field}, must be one of: ${validStatuses.join(', ')}`);
      }

      const { data, error } = await supabase
        .from('progress_management')
        .update({ [field]: status })
        .eq('student_number', studentNumber)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.national_id === studentNumber
            ? { ...student, progress: { ...student.progress, [field]: status } }
            : student
        )
      );

      // Update selected student if modal is open
      if (selectedStudent && selectedStudent.national_id === studentNumber) {
        setSelectedStudent(prev => ({
          ...prev,
          progress: { ...prev.progress, [field]: status }
        }));
      }

      return data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  const handleViewProgress = async (student) => {
    // Fetch all documents for this student
    const { data: docsData, error: docsError } = await supabase
      .from('documents')
      .select('*, attachments(*)')
      .eq('user_id', student.user_id);

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      return;
    }

    // Process all attachments
    const allAttachments = await Promise.all(
      (docsData || []).flatMap(doc => doc.attachments || []).map(async (attachment) => {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('documents')
          .createSignedUrl(attachment.file_path, 60 * 60); // 1 hour expiry

        return {
          ...attachment,
          file_url: signedUrlData?.signedUrl || null,
          file_type: attachment.file_type,
          document_id: attachment.document_id
        };
      })
    );

    setSelectedStudent({ ...student, attachments: allAttachments });
    setModalOpen(true);
  };
  



  return (
    <div className="p-6">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
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
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    student.progress?.application_review === 'approved' ? 'bg-green-100 text-green-700' : 
                    student.progress?.application_review === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {student.progress?.application_review === 'approved' ? 'Approved' : 
                     student.progress?.application_review === 'rejected' ? 'Rejected' : 'Pending'}
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
                status={selectedStudent.progress?.application_submitted || 'pending'}
                lastUpdated={selectedStudent.progress?.updated_at}
                onUpdate={async (newStatus) => {
                  await updateProgress(selectedStudent.national_id, 'application_submitted', newStatus);
                }}
                previewDoc={previewDoc}
                setPreviewDoc={setPreviewDoc}
              />

              {/* Documents Uploaded Step */}
              <ProgressStep
                label="Documents Uploaded"
                required
                status={selectedStudent.progress?.document_uploaded || 'pending'}
                lastUpdated={selectedStudent.progress?.updated_at}
                onUpdate={async (newStatus) => {
                  await updateProgress(selectedStudent.national_id, 'document_uploaded', newStatus);
                }}
                showViewDocuments
                attachments={selectedStudent.attachments || []}
                previewDoc={previewDoc}
                setPreviewDoc={setPreviewDoc}
              />

              {/* Payment Verified Step */}
              <ProgressStep
                label="Payment Verified"
                required
                status={selectedStudent.progress?.payment_verified || 'pending'}
                lastUpdated={selectedStudent.progress?.updated_at}
                onUpdate={async (newStatus) => {
                  await updateProgress(selectedStudent.national_id, 'payment_verified', newStatus);
                }}
                previewDoc={previewDoc}
                setPreviewDoc={setPreviewDoc}
              />

              {/* Application Review Card */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`inline-block w-5 h-5 rounded-full ${
                      selectedStudent.progress?.application_review === 'approved' ? 'bg-green-500 border-2 border-green-700' :
                      selectedStudent.progress?.application_review === 'rejected' ? 'bg-red-500 border-2 border-red-700 flex items-center justify-center' :
                      'bg-yellow-400 border-2 border-yellow-600'
                    }`}>
                      {selectedStudent.progress?.application_review === 'rejected' ? '✖' : ''}
                    </span>
                    <h4 className="text-lg font-semibold">Application Review</h4>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className={`px-4 py-1 rounded ${
                        selectedStudent.progress?.application_review === 'approved' ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      } font-semibold`}
                      onClick={async () => {
                        // Check if all other fields are complete
                        const progress = selectedStudent.progress;
                        const incompleteFields = [];
                        
                        if (progress.application_submitted !== 'complete') {
                          incompleteFields.push('Application Submission');
                        }
                        if (progress.document_uploaded !== 'complete') {
                          incompleteFields.push('Document Upload');
                        }
                        if (progress.payment_verified !== 'complete') {
                          incompleteFields.push('Payment Verification');
                        }

                        if (incompleteFields.length > 0) {
                          toast.error(`Cannot approve application. The following fields are not complete: ${incompleteFields.join(', ')}`);
                          return;
                        }

                        await updateProgress(selectedStudent.national_id, 'application_review', 'approved');
                        toast.success('Application approved successfully!');
                      }}
                    >Approve</button>
                    <button
                      className={`px-4 py-1 rounded ${
                        selectedStudent.progress?.application_review === 'in_progress' ? 'bg-blue-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      } font-semibold`}
                      onClick={async () => {
                        await updateProgress(selectedStudent.national_id, 'application_review', 'in_progress');
                        toast.success('Application status updated to In Progress');
                      }}
                    >In Progress</button>
                    <button
                      className={`px-4 py-1 rounded ${
                        selectedStudent.progress?.application_review === 'rejected' ? 'bg-red-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      } font-semibold`}
                      onClick={async () => {
                        await updateProgress(selectedStudent.national_id, 'application_review', 'rejected');
                        toast.success('Application rejected');
                      }}
                    >Reject</button>
                  </div>
                </div>
              </div>
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
      {previewDoc && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold">Preview: {previewDoc.type.charAt(0).toUpperCase() + previewDoc.type.slice(1)}</span>
              <span className="text-gray-500">{previewDoc.file_type}</span>
            </div>
            <button 
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 flex items-center gap-2"
              onClick={() => setPreviewDoc(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Close Preview
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <PDFViewer fileUrl={previewDoc.file_url} />
          </div>
        </div>
      )}
    </div>
  );
};

function ProgressStep({ label, required, status, lastUpdated, onUpdate, showViewDocuments, attachments, previewDoc, setPreviewDoc }) {
  const [showDocs, setShowDocs] = useState(false);
  const REQUIRED_TYPES = ['id', 'certificate', 'residence', 'payment'];

  let statusColor, icon, borderColor, bgColor;
  if (status === 'complete' || status === 'approved') {
    statusColor = 'bg-green-500';
    icon = <span className="inline-block w-5 h-5 rounded-full bg-green-500 border-2 border-green-700"></span>;
    borderColor = 'border-green-200';
    bgColor = 'bg-green-50';
  } else if (status === 'in_progress') {
    statusColor = 'bg-yellow-400';
    icon = <span className="inline-block w-5 h-5 rounded-full bg-yellow-400 border-2 border-yellow-600"></span>;
    borderColor = 'border-yellow-200';
    bgColor = 'bg-blue-50';
  } else if (status === 'rejected') {
    statusColor = 'bg-red-500';
    icon = <span className="inline-block w-5 h-5 rounded-full bg-red-500 border-2 border-red-700 flex items-center justify-center">✖</span>;
    borderColor = 'border-red-200';
    bgColor = 'bg-red-50';
  } else {
    statusColor = 'bg-gray-500';
    icon = <span className="inline-block w-5 h-5 rounded-full bg-gray-500 border-2 border-gray-700 flex items-center justify-center">-</span>;
    borderColor = 'border-gray-200';
    bgColor = 'bg-gray-100';
  }

  const handleViewFile = (doc) => {
    if (doc.file_type === 'application/pdf') {
      setPreviewDoc(doc);
    } else {
      toast.error('This file is not a PDF. Only PDF files can be previewed.');
    }
  };

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
            className={`px-4 py-1 rounded ${status === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'} font-semibold`}
            onClick={() => onUpdate('rejected')}
          >Reject</button>
        )}
      </div>
      {showViewDocuments && showDocs && (
        <div className="w-full mt-4 bg-gray-50 p-4 rounded shadow-inner">
          <h4 className="font-semibold mb-4">Uploaded Documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REQUIRED_TYPES.map(type => {
              const docs = attachments.filter(a => a.type === type);
              return (
                <div key={type} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    <span className="text-sm text-gray-500">{docs.length} file(s)</span>
                  </div>
                  {docs.length > 0 ? (
                    <div className="space-y-2">
                      {docs.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">File {index + 1}</span>
                          <button
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                            onClick={() => handleViewFile(doc)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-red-500 text-sm">Not Uploaded</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default RegProgress;