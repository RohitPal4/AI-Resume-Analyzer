import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud, FileText, Sparkles, X, CheckCircle,
  FileUp, Briefcase, ArrowRight, AlertCircle, Loader2
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(
        f => f.type === 'application/pdf'
      );
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type === 'application/pdf'
    );
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const processResumes = async () => {
    if (!jobDescription || files.length === 0) return;

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      let hasError = false;
      for (let i = 0; i < files.length; i++) {
        setCurrentFile(files[i].name);
        const formData = new FormData();
        formData.append('resume', files[i]);
        formData.append('jobDescription', jobDescription);

        const response = await fetch('http://localhost:5000/api/resume/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error uploading ${files[i].name}:`, errorData);
          alert(`Failed to process ${files[i].name}: ${errorData.error || 'Server error'}`);
          hasError = true;
          break;
        }

        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      if (!hasError) {
        navigate('/results');
      }
    } catch (error) {
      console.error('Error processing resumes:', error);
      alert('Network error while processing resumes. Is the server running?');
    } finally {
      setLoading(false);
      setProgress(0);
      setCurrentFile('');
    }
  };

  const isReady = jobDescription.trim().length > 0 && files.length > 0;

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Analyze Resumes</h1>
            <p className="dashboard-subtitle">
              Upload candidate resumes and paste the job description to get AI-powered match scores and feedback.
            </p>
          </div>
          <div className="dashboard-stats">
            <div className="stat-pill">
              <FileText size={16} />
              <span>{files.length} resume{files.length !== 1 ? 's' : ''}</span>
            </div>
            <div className={`stat-pill ${isReady ? 'stat-pill-ready' : ''}`}>
              {isReady ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{isReady ? 'Ready to analyze' : 'Fill both fields'}</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-grid">

          {/* Job Description Panel */}
          <div className="glass-panel dashboard-panel">
            <div className="panel-header">
              <div className="panel-icon panel-icon-jd">
                <Briefcase size={20} />
              </div>
              <div>
                <h3 className="panel-title">Job Description</h3>
                <p className="panel-desc">Paste the role requirements to evaluate candidates against</p>
              </div>
            </div>

            <div className="jd-textarea-wrapper">
              <textarea
                id="job-description-input"
                className="textarea-field jd-textarea"
                placeholder="e.g. We are looking for a Full Stack Developer with 3+ years of experience in React, Node.js, REST APIs, PostgreSQL. The ideal candidate should have strong problem-solving skills..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <div className="jd-char-count">
                {jobDescription.length} characters
              </div>
            </div>
          </div>

          {/* Upload Panel */}
          <div className="glass-panel dashboard-panel">
            <div className="panel-header">
              <div className="panel-icon panel-icon-upload">
                <FileUp size={20} />
              </div>
              <div>
                <h3 className="panel-title">Upload Resumes</h3>
                <p className="panel-desc">Drop PDF resumes here for instant AI analysis</p>
              </div>
            </div>

            <div
              id="upload-dropzone"
              className={`upload-dropzone ${isDragOver ? 'upload-dropzone-active' : ''} ${files.length > 0 ? 'upload-dropzone-has-files' : ''}`}
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="dropzone-icon">
                <UploadCloud size={36} />
              </div>
              <div className="dropzone-text">
                <span className="dropzone-title">
                  {isDragOver ? 'Drop files here' : 'Click or drag files to upload'}
                </span>
                <span className="dropzone-hint">PDF files only · Max 10MB per file</span>
              </div>
              <input
                id="file-upload-input"
                type="file"
                multiple
                accept=".pdf"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="file-list stagger">
                <div className="file-list-header">
                  <h5>Selected Files ({files.length})</h5>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => setFiles([])}
                  >
                    Clear all
                  </button>
                </div>
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-item-info">
                      <div className="file-item-icon">
                        <FileText size={16} />
                      </div>
                      <div>
                        <div className="file-item-name">{file.name}</div>
                        <div className="file-item-size">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                    <button
                      className="file-item-remove"
                      onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Processing Bar & Action */}
        <div className="dashboard-action-bar glass-panel">
          {loading && (
            <div className="processing-section animate-fade-in">
              <div className="processing-info">
                <Loader2 size={18} className="processing-spinner" />
                <span>Processing <strong>{currentFile}</strong></span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="processing-percent">{progress}%</span>
            </div>
          )}

          <button
            id="analyze-btn"
            className="btn btn-primary analyze-btn"
            onClick={processResumes}
            disabled={loading || !isReady}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Analyze {files.length > 0 ? `${files.length} Resume${files.length > 1 ? 's' : ''}` : 'Resumes'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .dashboard-page {
          padding-bottom: 2rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .dashboard-title {
          margin-bottom: 0.4rem;
        }

        .dashboard-subtitle {
          font-size: 1rem;
          max-width: 600px;
          margin-bottom: 0;
        }

        .dashboard-stats {
          display: flex;
          gap: 0.6rem;
          flex-shrink: 0;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .stat-pill-ready {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.2);
          color: var(--accent-light);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .dashboard-panel {
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .panel-icon {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .panel-icon-jd {
          background: rgba(99, 102, 241, 0.12);
          color: var(--primary-light);
        }

        .panel-icon-upload {
          background: rgba(16, 185, 129, 0.12);
          color: var(--accent-light);
        }

        .panel-title {
          font-size: 1.1rem;
          margin-bottom: 0.15rem;
        }

        .panel-desc {
          font-size: 0.85rem;
          margin-bottom: 0;
          color: var(--text-muted);
        }

        /* Job Description */
        .jd-textarea-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .jd-textarea {
          flex: 1;
          min-height: 320px;
          border-radius: var(--radius-md);
          font-size: 0.92rem;
          line-height: 1.7;
          padding: 1rem 1.25rem;
          padding-bottom: 2.5rem;
        }

        .jd-char-count {
          position: absolute;
          bottom: 0.75rem;
          right: 1rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
        }

        /* Upload Dropzone */
        .upload-dropzone {
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
          background: rgba(12, 18, 38, 0.4);
          position: relative;
          overflow: hidden;
        }

        .upload-dropzone::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(99, 102, 241, 0.04), transparent 70%);
          opacity: 0;
          transition: var(--transition);
        }

        .upload-dropzone:hover,
        .upload-dropzone-active {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.04);
        }

        .upload-dropzone:hover::before,
        .upload-dropzone-active::before {
          opacity: 1;
        }

        .upload-dropzone-has-files {
          padding: 1.5rem;
        }

        .dropzone-icon {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-lg);
          background: rgba(99, 102, 241, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-light);
          margin-bottom: 1rem;
          transition: var(--transition);
        }

        .upload-dropzone:hover .dropzone-icon {
          transform: translateY(-4px);
          background: rgba(99, 102, 241, 0.15);
        }

        .dropzone-title {
          display: block;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .dropzone-hint {
          display: block;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        /* File List */
        .file-list {
          margin-top: 1rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .file-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .file-list-header h5 {
          margin: 0;
          font-size: 0.82rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          margin-bottom: 0.4rem;
          transition: var(--transition-fast);
        }

        .file-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--border-hover);
        }

        .file-item-info {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          min-width: 0;
        }

        .file-item-icon {
          width: 32px;
          height: 32px;
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .file-item-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }

        .file-item-size {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
        }

        .file-item-remove {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.3rem;
          border-radius: 6px;
          display: flex;
          transition: var(--transition-fast);
        }

        .file-item-remove:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        /* Action Bar */
        .dashboard-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 1.25rem 2rem;
        }

        .analyze-btn {
          padding: 0.85rem 2rem;
          font-size: 1rem;
          flex-shrink: 0;
          margin-left: auto;
        }

        .processing-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .processing-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .processing-spinner {
          animation: spin 1s linear infinite;
          color: var(--primary-light);
        }

        .processing-section .progress-bar {
          flex: 1;
          min-width: 100px;
        }

        .processing-percent {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary-light);
          font-family: 'JetBrains Mono', monospace;
          min-width: 36px;
          text-align: right;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-header {
            flex-direction: column;
          }

          .dashboard-action-bar {
            flex-direction: column;
            padding: 1.25rem;
          }

          .analyze-btn {
            width: 100%;
            margin-left: 0;
          }

          .processing-section {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
