import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './FileUpload.css';

const FileUpload = ({ onFileSelect, index }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    onFileSelect(file);
    console.log(index);
  };

  return (
    <div className="file-upload-container">
      <label htmlFor={`file-upload${index}`} className="custom-file-upload">
        <i className="fa-solid fa-cloud-arrow-up"></i>
      </label>
      <input
        id={`file-upload${index}`}
        type="file"
        accept=".pdf"
        className="file-info"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div className="file-info">
        {selectedFile ? <p>{selectedFile.name}</p> : <p></p>}
      </div>
    </div>
  );
};

export default FileUpload;
