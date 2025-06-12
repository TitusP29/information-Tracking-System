import React, { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

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

const ProgressStep = ({ label, required, status, lastUpdated, onUpdate, showViewDocuments, attachments, previewDoc, setPreviewDoc }) => {
  const statusColors = {
    complete: 'bg-green-100 text-green-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const handlePreview = (doc) => {
    setPreviewDoc(doc);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold mb-1">{label}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[status] || statusColors['pending']}`}>
              {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
            </span>
            {lastUpdated && (
              <span className="text-sm text-gray-600">
                Last updated: {new Date(lastUpdated).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        {onUpdate && (
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate('complete')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Complete
            </button>
            <button
              onClick={() => onUpdate('in_progress')}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              In Progress
            </button>
            <button
              onClick={() => onUpdate('rejected')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        )}
      </div>
      {showViewDocuments && attachments && attachments.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Uploaded Documents</h4>
          <div className="space-y-3">
            {['id', 'certificate', 'residence', 'payment'].map((type) => {
              const doc = attachments.find(a => a.document_id === type);
              if (!doc) return null;
              
              return (
                <div key={type} className="flex items-center gap-4">
                  <span className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}:</span>
                  <button
                    onClick={() => handlePreview(doc)}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View
                  </button>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-600">{doc.file_type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Preview: {previewDoc.type.charAt(0).toUpperCase() + previewDoc.type.slice(1)}</h4>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
            {previewDoc.file_type === 'application/pdf' ? (
              <PDFViewer fileUrl={previewDoc.file_url} />
            ) : previewDoc.file_type.startsWith('image/') ? (
              <img 
                src={previewDoc.file_url} 
                alt={previewDoc.type} 
                className="max-w-full max-h-[600px] object-contain"
              />
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
        </div>
      )}
    </div>
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
    const { data, error } = await supabase
      .from('register')
      .select('*')
      .order('reg_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      return;
    }

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
    const { data: docsData, error: docsError } = await supabase
      .from('documents')
      .select('*, attachments(*)')
      .eq('user_id', student.user_id);

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      return;
    }

    const allAttachments = await Promise.all(
      (docsData || []).flatMap(doc => doc.attachments || []).map(async (attachment) => {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('documents')
          .createSignedUrl(attachment.file_path, 60 * 60);

        return {
          ...attachment,
          file_url: signedUrlData?.signedUrl || null,
          file_type: attachment.file_type,
          document_id: attachment.document_id
        };
      })
    );

    setSelectedStudent({ 
      ...student, 
      attachments: allAttachments,
      documents: {
        application_status: student.documents?.application_status || 'complete',
        application_updated_at: student.documents?.application_updated_at || student.reg_date,
        documents_status: student.documents?.documents_status || 'in_progress',
        documents_updated_at: student.documents?.documents_updated_at,
        payment_status: student.documents?.payment_status || 'pending',
        payment_updated_at: student.documents?.payment_updated_at
      }
    });
    setModalOpen(true);
  };

  const handleDocumentVerification = async (docType, userId) => {
    if (!userId) return;

    try {
      const columnMap = {
        'id': { uploaded: 'id_uploaded', verified: 'identitydoc' },
        'certificate': { uploaded: 'certificate_uploaded', verified: 'academicrecord' },
        'residence': { uploaded: 'residence_uploaded', verified: 'proofofaddress' },
        'payment': { uploaded: 'payment_uploaded', verified: 'paymentproof' }
      };

      const columns = columnMap[docType];
      if (!columns) return;

      const { error } = await supabase
        .from('documents')
        .update({
          [columns.uploaded]: true,
          [columns.verified]: true
        })
        .eq('user_id', userId);

      if (error) throw error;

      await fetchStudents();
    } catch (error) {
      console.error('Error verifying document:', error);
    }
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
                showViewDocuments={false}
                previewDoc={previewDoc}
                setPreviewDoc={setPreviewDoc}
              />
              <ProgressStep
                label="Documents Uploaded"
                required
                status={selectedStudent.documents?.documents_status || 'in_progress'}
                lastUpdated={selectedStudent.documents?.documents_updated_at}
                onUpdate={async (newStatus) => {
                  try {
                    await supabase
                      .from('documents')
                      .update({
                        documents_status: newStatus,
                        documents_updated_at: new Date().toISOString()
                      })
                      .eq('user_id', selectedStudent.user_id);
                    await fetchStudents();
                    setSelectedStudent(s => ({ 
                      ...s, 
                      documents: { 
                        ...s.documents, 
                        documents_status: newStatus, 
                        documents_updated_at: new Date().toISOString() 
                      } 
                    }));
                  } catch (error) {
                    console.error('Error updating documents status:', error);
                  }
                }}
                showViewDocuments={true}
                attachments={selectedStudent.attachments || []}
                previewDoc={previewDoc}
                setPreviewDoc={setPreviewDoc}
              />
              <ProgressStep
                label="Payment Verified"
                required
                status={selectedStudent.documents?.payment_status || 'pending'}
                lastUpdated={selectedStudent.documents?.payment_updated_at}
                onUpdate={async (newStatus) => {
                  try {
                    await supabase
                      .from('documents')
                      .update({
                        payment_status: newStatus,
                        payment_updated_at: new Date().toISOString()
                      })
                      .eq('user_id', selectedStudent.user_id);
                    await fetchStudents();
                    setSelectedStudent(s => ({ 
                      ...s, 
                      documents: { 
                        ...s.documents, 
                        payment_status: newStatus, 
                        payment_updated_at: new Date().toISOString() 
                      } 
                    }));
                  } catch (error) {
                    console.error('Error updating payment status:', error);
                  }
                }}
                showViewDocuments={false}
                previewDoc={previewDoc}
                setPreviewDoc={setPreviewDoc}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegProgress;