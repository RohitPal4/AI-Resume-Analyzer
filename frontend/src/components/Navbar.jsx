import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Brain, LogOut, LayoutDashboard, BarChart3, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-brand" id="nav-logo">
          <div className="nav-brand-icon">
            <Brain size={22} />
          </div>
          <span>ResumeAI</span>
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            id="nav-dashboard"
            className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <Link
            to="/results"
            id="nav-results"
            className={`nav-link ${isActive('/results') ? 'nav-link-active' : ''}`}
          >
            <BarChart3 size={16} />
            Results
          </Link>
        </div>
      </div>

      <div className="nav-right">
        <div className="nav-user">
          <div className="nav-avatar">
            <User size={16} />
          </div>
          <span className="nav-username">{username}</span>
        </div>

        <button
          id="nav-logout-btn"
          onClick={handleLogout}
          className="btn btn-ghost nav-logout"
          data-tooltip="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>

      <style>{`
        .navbar {
          padding: 0 2rem;
          height: 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          background: rgba(6, 8, 15, 0.85);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          position: sticky;
          top: 0;
          z-index: 100;
          border-radius: 0 !important;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 800;
          font-size: 1.2rem;
          letter-spacing: -0.02em;
          transition: var(--transition-fast);
        }

        .nav-brand:hover {
          opacity: 0.85;
        }

        .nav-brand-icon {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, var(--primary), #7c3aed);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 2px 8px var(--primary-glow);
        }

        .nav-links {
          display: flex;
          gap: 0.25rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
          text-decoration: none;
          transition: var(--transition-fast);
          position: relative;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }

        .nav-link-active {
          color: var(--primary-light);
          background: rgba(99, 102, 241, 0.1);
        }

        .nav-link-active::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: var(--primary);
          border-radius: var(--radius-full);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.4rem 0.75rem 0.4rem 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
        }

        .nav-avatar {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.2));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-accent);
        }

        .nav-username {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .nav-logout {
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          padding: 0.45rem;
        }

        .nav-logout:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 0 1rem;
          }

          .nav-links {
            display: none;
          }

          .nav-username {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
