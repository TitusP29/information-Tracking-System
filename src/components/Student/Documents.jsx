import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const REQUIRED_DOCUMENTS = [
  { id: 'id', label: 'ID Document' },
  { id: 'certificate', label: 'Latest Certificate' },
  { id: 'residence', label: 'Proof of Residence' },
  { id: 'payment', label: 'Proof of Payment' }
];

function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRefs = useRef({});

  useEffect(() => {
    fetchUserDocuments();
  }, [user]);

  const fetchUserDocuments = async () => {
    if (!user) return;

    try {
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select(`
          *,
          attachments (
            id,
            file_name,
            file_path,
            url
          )
        `)
        .eq('user_id', user.id);

      if (docsError) throw docsError;
      setDocuments(docsData || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setMessage('Failed to load documents');
    }
  };

  const handleFileChange = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(extension)) {
      setMessage('Invalid file type. Allowed types: PDF, DOC, DOCX, JPG, PNG');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File too large. Maximum size: 5MB');
      return;
    }

    setSelectedDocType(docType);
    await uploadDocument(file, docType);
  };

  const uploadDocument = async (file, docType) => {
    if (!user) return;

    setUploading(true);
    setMessage('Uploading...');

    try {
      // Upload file to Supabase Storage
      const fileName = `${user.id}/${docType}_${Date.now()}${file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // First create or update document record
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .upsert({
          user_id: user.id,
          type: docType,
          status: 'UPLOADED',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (docError) throw docError;

      // Then create attachment record linked to document
      const { error: attachError } = await supabase
        .from('attachments')
        .insert({
          document_id: docData.id,
          file_name: file.name,
          file_path: fileName,
          url: publicUrl,
          uploaded_at: new Date().toISOString()
        });

      if (attachError) throw attachError;

      setMessage('Document uploaded successfully');
      fetchUserDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      setMessage('Failed to upload document');
    } finally {
      setUploading(false);
      setSelectedDocType('');
    }
  };

  const removeDocument = async (docId) => {
    if (!user) return;

    setUploading(true);
    setMessage('Removing...');

    try {
      const doc = documents.find(d => d.id === docId);
      if (!doc?.attachments?.[0]) throw new Error('Document not found');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.attachments[0].file_path]);

      if (storageError) throw storageError;

      // Delete from attachments table
      const { error: attachError } = await supabase
        .from('attachments')
        .delete()
        .eq('document_id', doc.id);

      if (attachError) throw attachError;

      // Delete from documents table
      const { error: docError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (docError) throw docError;

      setMessage('Document removed successfully');
      fetchUserDocuments();
    } catch (error) {
      console.error('Error removing document:', error);
      setMessage('Failed to remove document');
    } finally {
      setUploading(false);
    }
  };

  const getDocumentStatus = (docType) => {
    return documents.some(doc => doc.type === docType && doc.attachments?.length > 0)
      ? 'UPLOADED'
      : 'MISSING';
  };

  const handleUploadClick = (docId) => {
    fileInputRefs.current[docId]?.click();
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Upload Application Documents</h1>
        <div className="flex gap-2">
          <Link 
            to="/dashboard" 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
          >
            Back to Dashboard
          </Link>
          <Link 
            to="/logout" 
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
          >
            Logout
          </Link>
        </div>
      </div>

      <Card className="mb-6 bg-white shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Status:</span>
            <span className={`px-3 py-1 rounded-md ${
              documents.length === REQUIRED_DOCUMENTS.length 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {documents.length === REQUIRED_DOCUMENTS.length ? 'Documents Uploaded' : 'Pending Documents'}
            </span>
          </div>
          {documents.length === REQUIRED_DOCUMENTS.length && (
            <p className="text-emerald-600 mt-2 italic">
              Thank you for uploading all your documents.
              <br />
              Your application is now complete and pending admin review.
            </p>
          )}
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Required Documents</h2>
      
      {message && (
        <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REQUIRED_DOCUMENTS.map((doc) => {
          const status = getDocumentStatus(doc.id);
          const existingDoc = documents.find(d => d.type === doc.id);
          const attachment = existingDoc?.attachments?.[0];

          return (
            <Card key={doc.id} className="bg-white shadow">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{doc.label}</h3>
                      {attachment && (
                        <p className="text-sm text-gray-500 mt-1">
                          File: {attachment.file_name}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'UPLOADED' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {status}
                    </span>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-2">
                    {status === 'UPLOADED' ? (
                      <>
                        <a
                          href={attachment?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
                        >
                          View
                        </a>
                        <button
                          onClick={() => removeDocument(existingDoc.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
                          disabled={uploading}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <div className="w-full">
                        <input
                          type="file"
                          ref={el => fileInputRefs.current[doc.id] = el}
                          className="hidden"
                          onChange={(e) => handleFileChange(e, doc.id)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          disabled={uploading}
                        />
                        <Button
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                          disabled={uploading}
                          onClick={() => handleUploadClick(doc.id)}
                        >
                          {uploading && selectedDocType === doc.id ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading...
                            </span>
                          ) : (
                            'UPLOAD'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default Documents;
