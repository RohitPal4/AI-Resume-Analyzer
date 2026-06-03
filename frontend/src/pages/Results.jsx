import { useState, useEffect } from 'react';
import {
  Award, User, Mail, Star, Briefcase, GraduationCap,
  ArrowLeft, TrendingUp, Target, MessageSquare, Trophy,
  ChevronRight, Search, SortDesc, FileText, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function Results() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/resume/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setResumes(data);
      if (data.length > 0) {
        setSelectedResume(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--score-high)';
    if (score >= 50) return 'var(--score-mid)';
    return 'var(--score-low)';
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'high';
    if (score >= 50) return 'mid';
    return 'low';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  };

  const getRankBadge = (index) => {
    if (index === 0) return { icon: '🥇', bg: 'rgba(255, 215, 0, 0.1)', border: 'rgba(255, 215, 0, 0.3)' };
    if (index === 1) return { icon: '🥈', bg: 'rgba(192, 192, 192, 0.1)', border: 'rgba(192, 192, 192, 0.3)' };
    if (index === 2) return { icon: '🥉', bg: 'rgba(205, 127, 50, 0.1)', border: 'rgba(205, 127, 50, 0.3)' };
    return null;
  };

  const filteredResumes = resumes.filter(r => {
    const name = r.extractedData?.Name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-light)' }} />
        <h3 style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Loading results...</h3>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="flex-center animate-fade-in" style={{ minHeight: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 'var(--radius-lg)',
          background: 'rgba(99, 102, 241, 0.08)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem'
        }}>
          <FileText size={36} style={{ color: 'var(--primary-light)' }} />
        </div>
        <h2>No Resumes Analyzed Yet</h2>
        <p style={{ textAlign: 'center', maxWidth: 400 }}>
          Upload resumes on the dashboard and let our AI analyze them against your job description.
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          <ArrowLeft size={18} /> Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="results-page animate-fade-in">
      <div className="results-layout">

        {/* Sidebar — Ranked Candidates */}
        <aside className="results-sidebar glass-panel">
          <div className="sidebar-header">
            <div className="sidebar-title-row">
              <Trophy size={18} style={{ color: 'var(--accent-light)' }} />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Candidates</h3>
            </div>
            <span className="sidebar-count">{resumes.length}</span>
          </div>

          {/* Search */}
          <div className="sidebar-search">
            <Search size={16} className="sidebar-search-icon" />
            <input
              id="candidate-search"
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sidebar-search-input"
            />
          </div>

          {/* Candidate List */}
          <div className="candidate-list stagger">
            {filteredResumes.map((resume, index) => {
              const rankBadge = getRankBadge(index);
              return (
                <div
                  key={resume.id}
                  id={`candidate-${resume.id}`}
                  className={`candidate-card ${selectedResume?.id === resume.id ? 'candidate-card-active' : ''}`}
                  onClick={() => setSelectedResume(resume)}
                >
                  <div className="candidate-card-left">
                    <div className="candidate-rank">
                      {rankBadge ? (
                        <span style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 32, height: 32, borderRadius: '50%',
                          background: rankBadge.bg, border: `1px solid ${rankBadge.border}`,
                          fontSize: '1rem'
                        }}>
                          {rankBadge.icon}
                        </span>
                      ) : (
                        <span className="candidate-rank-number">#{index + 1}</span>
                      )}
                    </div>
                    <div className="candidate-info">
                      <div className="candidate-name">
                        {resume.extractedData?.Name || 'Unknown'}
                      </div>
                      <div className="candidate-file">{resume.originalName}</div>
                    </div>
                  </div>

                  <div className={`score-badge ${getScoreClass(resume.matchScore)}`}>
                    {resume.matchScore}%
                  </div>
                </div>
              );
            })}

            {filteredResumes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No candidates match your search.
              </div>
            )}
          </div>
        </aside>

        {/* Main — Detail View */}
        <main className="results-main">
          {selectedResume ? (
            <div className="detail-content animate-fade-in" key={selectedResume.id}>

              {/* Header Card */}
              <div className="glass-panel detail-header">
                <div className="detail-header-left">
                  <div className="detail-avatar">
                    <User size={28} />
                  </div>
                  <div>
                    <h2 className="detail-name">
                      {selectedResume.extractedData?.Name || 'Candidate'}
                    </h2>
                    <div className="detail-meta">
                      <span className="detail-meta-item">
                        <Mail size={14} />
                        {selectedResume.extractedData?.Email || 'N/A'}
                      </span>
                      <span className="detail-meta-item">
                        <FileText size={14} />
                        {selectedResume.originalName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Ring */}
                <div className="score-ring-container">
                  <svg className="score-ring" viewBox="0 0 120 120">
                    <circle className="score-ring-bg" cx="60" cy="60" r="50" />
                    <circle
                      className="score-ring-fill"
                      cx="60" cy="60" r="50"
                      style={{
                        stroke: getScoreColor(selectedResume.matchScore),
                        strokeDasharray: `${(selectedResume.matchScore / 100) * 314} 314`
                      }}
                    />
                  </svg>
                  <div className="score-ring-value">
                    <span className="score-ring-number" style={{ color: getScoreColor(selectedResume.matchScore) }}>
                      {selectedResume.matchScore}
                    </span>
                    <span className="score-ring-label">{getScoreLabel(selectedResume.matchScore)}</span>
                  </div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="detail-cards">
                <div className="glass-panel detail-card">
                  <div className="detail-card-header">
                    <Briefcase size={18} style={{ color: 'var(--primary-light)' }} />
                    <h4>Experience</h4>
                  </div>
                  <p className="detail-card-text">
                    {selectedResume.extractedData?.Experience || 'Not specified'}
                  </p>
                </div>

                <div className="glass-panel detail-card">
                  <div className="detail-card-header">
                    <GraduationCap size={18} style={{ color: 'var(--accent-light)' }} />
                    <h4>Education</h4>
                  </div>
                  <p className="detail-card-text">
                    {selectedResume.extractedData?.Education || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="glass-panel detail-skills-panel">
                <div className="detail-card-header">
                  <Star size={18} style={{ color: '#f59e0b' }} />
                  <h4>Skills</h4>
                  {selectedResume.extractedData?.Skills && (
                    <span className="skills-count">{selectedResume.extractedData.Skills.length} skills</span>
                  )}
                </div>
                <div className="skills-grid">
                  {selectedResume.extractedData?.Skills?.map((skill, i) => (
                    <span key={i} className="tag">{skill}</span>
                  )) || <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No skills extracted</span>}
                </div>
              </div>

              {/* AI Feedback */}
              <div className="glass-panel detail-feedback">
                <div className="detail-card-header">
                  <MessageSquare size={18} style={{ color: 'var(--primary-light)' }} />
                  <h4>AI Analysis & Feedback</h4>
                </div>
                <div className="feedback-content markdown-body">
                  <ReactMarkdown>{selectedResume.feedback}</ReactMarkdown>
                </div>
              </div>

            </div>
          ) : null}
        </main>

      </div>

      <style>{`
        .results-page {
          padding: 0;
          height: calc(100vh - 60px);
          overflow: hidden;
        }

        .results-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          height: 100%;
        }

        /* ─── Sidebar ─── */
        .results-sidebar {
          border-radius: 0;
          border-right: 1px solid var(--border);
          border-top: none;
          border-bottom: none;
          border-left: none;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .sidebar-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sidebar-count {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
        }

        .sidebar-search {
          position: relative;
          margin-bottom: 1rem;
        }

        .sidebar-search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .sidebar-search-input {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0.6rem 0.75rem 0.6rem 2.25rem;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.85rem;
          transition: var(--transition);
          outline: none;
        }

        .sidebar-search-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
        }

        .candidate-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .candidate-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition-fast);
          border: 1px solid transparent;
          background: transparent;
        }

        .candidate-card:hover {
          background: var(--bg-hover);
          border-color: var(--border);
        }

        .candidate-card-active {
          background: rgba(99, 102, 241, 0.1) !important;
          border-color: rgba(99, 102, 241, 0.25) !important;
          box-shadow: 0 2px 12px rgba(99, 102, 241, 0.1);
        }

        .candidate-card-left {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          min-width: 0;
        }

        .candidate-rank-number {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
          flex-shrink: 0;
        }

        .candidate-info {
          min-width: 0;
        }

        .candidate-name {
          font-weight: 600;
          font-size: 0.88rem;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .candidate-file {
          font-size: 0.72rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }

        /* ─── Main Detail ─── */
        .results-main {
          overflow-y: auto;
          padding: 1.5rem 2rem;
        }

        .detail-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 1.5rem;
        }

        .detail-header-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          min-width: 0;
        }

        .detail-avatar {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.15));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-accent);
          flex-shrink: 0;
        }

        .detail-name {
          margin-bottom: 0.35rem;
          font-size: 1.4rem;
        }

        .detail-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .detail-meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        /* Score Ring */
        .score-ring-container {
          position: relative;
          width: 100px;
          height: 100px;
          flex-shrink: 0;
        }

        .score-ring {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .score-ring-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.05);
          stroke-width: 8;
        }

        .score-ring-fill {
          fill: none;
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dasharray 1s var(--ease);
        }

        .score-ring-value {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .score-ring-number {
          font-size: 1.75rem;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1;
        }

        .score-ring-label {
          font-size: 0.62rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 500;
          margin-top: 0.2rem;
        }

        /* Detail Cards */
        .detail-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .detail-card {
          padding: 1.25rem;
        }

        .detail-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.85rem;
        }

        .detail-card-header h4 {
          margin: 0;
          font-size: 0.92rem;
        }

        .detail-card-text {
          font-size: 0.88rem;
          line-height: 1.7;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Skills */
        .detail-skills-panel {
          margin-bottom: 1rem;
          padding: 1.25rem;
        }

        .skills-count {
          margin-left: auto;
          font-size: 0.72rem;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
        }

        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        /* Feedback */
        .detail-feedback {
          padding: 1.5rem;
          background: rgba(99, 102, 241, 0.04);
          border-color: rgba(99, 102, 241, 0.12);
        }

        .feedback-content {
          font-size: 0.9rem;
          line-height: 1.85;
          color: var(--text-secondary);
        }

        .markdown-body p {
          margin-top: 0;
          margin-bottom: 1rem;
        }

        .markdown-body p:last-child {
          margin-bottom: 0;
        }

        .markdown-body strong {
          color: var(--text-primary);
          font-weight: 600;
        }

        .markdown-body ul {
          margin-top: 0.5rem;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .markdown-body li {
          margin-bottom: 0.5rem;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .results-layout {
            grid-template-columns: 1fr;
            height: auto;
          }

          .results-page {
            height: auto;
            overflow: auto;
          }

          .results-sidebar {
            border-right: none;
            border-bottom: 1px solid var(--border);
            max-height: 50vh;
          }

          .results-main {
            padding: 1rem;
          }

          .detail-header {
            flex-direction: column;
            text-align: center;
          }

          .detail-header-left {
            flex-direction: column;
            align-items: center;
          }

          .detail-meta {
            justify-content: center;
          }

          .detail-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
