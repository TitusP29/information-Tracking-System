import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

function UploadDocument({ requiredDocuments = [], onComplete }) {
  const [documents, setDocuments] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size and type validation
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedTypes.includes(extension)) {
      setMessage('Invalid file type.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File too large. Max 5MB.');
      return;
    }

    uploadDocument(file);
  };

  const uploadDocument = (file) => {
    setUploading(true);
    setMessage('Uploading...');

    const newDoc = {
      id: Date.now(),
      name: file.name,
      type: selectedDocType,
      label: requiredDocuments.find(d => d.id === selectedDocType)?.label || '',
      size: file.size,
      url: URL.createObjectURL(file),
      uploadDate: new Date().toISOString()
    };

    setTimeout(() => {
      setDocuments(prev => [...prev, newDoc]);
      setUploading(false);
      setSelectedDocType('');
      setMessage('Document uploaded.');
    }, 1000);
  };

  const removeDocument = (id) => {
    setUploading(true);
    setMessage('Removing...');
    setTimeout(() => {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      setUploading(false);
      setMessage('Document removed.');
    }, 500);
  };

  const isUploaded = (docId) => documents.some(doc => doc.type === docId);
  const allUploaded = requiredDocuments.every(doc => isUploaded(doc.id));

  return (
    <div className="upload-container">
      <h2>Upload Documents</h2>

      {message && <div className="message">{message}</div>}

      <div className="required-docs">
        <h4>Required Documents:</h4>
        <ul>
          {requiredDocuments.map(doc => (
            <li key={doc.id}>
              {doc.label} — {isUploaded(doc.id) ? '✅ Uploaded' : '❌ Missing'}
            </li>
          ))}
        </ul>
      </div>

      {!allUploaded && (
        <form className="upload-form">
          <select
            value={selectedDocType}
            onChange={e => setSelectedDocType(e.target.value)}
            disabled={uploading}
          >
            <option value="">Select Document Type</option>
            {requiredDocuments.filter(doc => !isUploaded(doc.id)).map(doc => (
              <option key={doc.id} value={doc.id}>{doc.label}</option>
            ))}
          </select>

          <label className={`upload-btn ${uploading || !selectedDocType ? 'disabled' : ''}`}>
            {uploading ? <FaSpinner className="spinner" /> : 'Choose File'}
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={uploading || !selectedDocType}
              style={{ display: 'none' }}
            />
          </label>
        </form>
      )}

      <div className="uploaded-docs">
        <h4>Uploaded Documents:</h4>
        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          <ul>
            {documents.map(doc => (
              <li key={doc.id}>
                <strong>{doc.label}</strong> — {doc.name} —{' '}
                <a href={doc.url} target="_blank" rel="noopener noreferrer">Preview</a>
                <button onClick={() => removeDocument(doc.id)} disabled={uploading}>
                  {uploading ? <FaSpinner className="spinner" /> : 'Remove'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {allUploaded && (
        <div className="success-box">
          ✅ All required documents uploaded!
        </div>
      )}
    </div>
  );
}

export default UploadDocument;
