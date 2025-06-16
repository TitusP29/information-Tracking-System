import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

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
  

    const { data: docsData, error: docsError } = await supabase
      .from('documents')
      .select('*, attachments(*)')
      .eq('user_id', user.id);
    
    if (docsError) {
      console.error('Error fetching user documents:', docsError);
      setDocuments({});
      return;
    }
    
    if (docsData?.length) {
      const allAttachments = docsData.flatMap(doc => doc.attachments || []);
      const updatedAttachments = await Promise.all(
        allAttachments.map(async (attachment) => {
          const { data, error } = await supabase.storage
            .from('documents')
            .createSignedUrl(attachment.file_path, 3600); // 1 hour expiry
          
          if (error) {
            console.error('Signed URL error:', error);
            return { ...attachment, signedUrl: null };
          }
  
          return { ...attachment, signedUrl: data.signedUrl };
        })
      );
  
      docsData.attachments = updatedAttachments;
    }
  
    setDocuments(docsData || {});
  };
  

  

  const handleFileChange = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Only allow PDF files
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed. Please upload a PDF document.');
      e.target.value = ''; // Clear the file input
      return;
    }

    // Size validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size: 5MB');
      e.target.value = ''; // Clear the file input
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
      const fileName = `${user.id}/${docType}_${Date.now()}_${file.name}`;
      
      // Ensure proper content type for PDFs
      const contentType = file.type === 'application/pdf' ? 'application/pdf' : file.type;
      
      console.log('Uploading file:', {
        name: file.name,
        type: contentType,
        size: file.size
      });

      const { data: fileData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });
  
      if (uploadError) throw uploadError;
  
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .upsert({
          user_id: user.id,
          status: 'UPLOADED'
        })
        .select()
        .single();
  
      if (docError) throw docError;
  
      const { error: attachError } = await supabase
        .from('attachments')
        .insert({
          document_id: docData.id,
          file_path: fileName,
          file_type: contentType,
          type: docType,
          uploaded_at: new Date().toISOString()
        });
  
      if (attachError) throw attachError;
  
      const booleanField = {
        id: 'id_uploaded',
        certificate: 'certificate_uploaded',
        residence: 'residence_uploaded',
        payment: 'payment_uploaded'
      }[docType];
  
      if (booleanField) {
        await supabase
          .from('documents')
          .update({ [booleanField]: true })
          .eq('id', docData.id);

        const { data: docStatus } = await supabase
          .from('documents')
          .select('id_uploaded,certificate_uploaded,residence_uploaded,payment_uploaded')
          .eq('id', docData.id)
          .single();

        if (
          docStatus?.id_uploaded &&
          docStatus?.certificate_uploaded &&
          docStatus?.residence_uploaded &&
          docStatus?.payment_uploaded
        ) {
          await supabase
            .from('documents')
            .update({ status: 'approved' })
            .eq('id', docData.id);
        }
      }
  
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
        .remove([doc.attachments[0].file_url]);

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
    return documents && documents[`${docType}_uploaded`];
  };

  const handleUploadClick = (docId) => {
    fileInputRefs.current[docId]?.click();
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Upload Application Documents</h1>
        
      </div>

  


      <h2 className="text-xl font-bold mb-4">Required Documents</h2>
      
      {message && (
        <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REQUIRED_DOCUMENTS.map((doc) => {
          const existingDoc = documents && documents[doc.id];
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
                          File: {attachment.file_url}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getDocumentStatus(doc.id) 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : ''
                    }`}>
                      {getDocumentStatus(doc.id) ? 'UPLOADED' : ''}
                    </span>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-2">
                    {getDocumentStatus(doc.id) ? (
                      <>
                        <a
                            href={attachment.signedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
                          >
                            Download
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
                          accept=".pdf"
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
