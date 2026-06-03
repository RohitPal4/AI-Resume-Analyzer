import { useState } from 'react';
import { Brain, Sparkles, Eye, EyeOff, ArrowRight, Shield, Zap, Users } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userId', data.userId);
        window.location.href = '/';
      } else {
        setIsLogin(true);
        setSuccess('Account created successfully! Please sign in.');
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Zap size={20} />, title: 'AI-Powered Analysis', desc: 'Instant resume scoring using advanced AI' },
    { icon: <Users size={20} />, title: 'Candidate Ranking', desc: 'Auto-rank candidates by job fit' },
    { icon: <Shield size={20} />, title: 'Actionable Feedback', desc: 'Detailed strengths & improvement areas' },
  ];

  return (
    <div className="login-page">
      {/* Ambient decoration */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />

      <div className="login-container animate-fade-in">
        {/* Left — Branding / Hero */}
        <div className="login-hero">
          <div className="login-hero-content">
            <div className="login-logo">
              <div className="login-logo-icon">
                <Brain size={32} />
              </div>
              <span className="login-logo-text">ResumeAI</span>
            </div>

            <h1 className="login-hero-title">
              Hire Smarter.<br />Hire Faster.
            </h1>
            <p className="login-hero-subtitle">
              AI-driven resume analysis that transforms your hiring workflow.
              Match candidates to roles in seconds, not hours.
            </p>

            <div className="login-features stagger">
              {features.map((f, i) => (
                <div key={i} className="login-feature-item">
                  <div className="login-feature-icon">{f.icon}</div>
                  <div>
                    <div className="login-feature-title">{f.title}</div>
                    <div className="login-feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative gradient mesh */}
          <div className="login-hero-mesh" />
        </div>

        {/* Right — Form */}
        <div className="login-form-section">
          <div className="login-form-wrapper">
            <div className="login-form-header">
              <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
              <p>{isLogin ? 'Sign in to continue to your dashboard' : 'Start analyzing resumes with AI today'}</p>
            </div>

            {error && (
              <div className="login-alert login-alert-error animate-scale-in">
                <div className="login-alert-dot" />
                {error}
              </div>
            )}

            {success && (
              <div className="login-alert login-alert-success animate-scale-in">
                <div className="login-alert-dot" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  type="text"
                  className="input-field"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="input-group">
                <label htmlFor="login-password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="btn btn-primary login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Processing...
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="login-switch">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                className="login-switch-btn"
                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
              >
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }

        .login-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .login-bg-orb-1 {
          width: 400px;
          height: 400px;
          background: rgba(99, 102, 241, 0.12);
          top: -10%;
          left: -5%;
          animation: orbFloat 18s ease-in-out infinite;
        }

        .login-bg-orb-2 {
          width: 350px;
          height: 350px;
          background: rgba(16, 185, 129, 0.1);
          bottom: -10%;
          right: -5%;
          animation: orbFloat 22s ease-in-out infinite reverse;
        }

        .login-bg-orb-3 {
          width: 250px;
          height: 250px;
          background: rgba(139, 92, 246, 0.08);
          top: 50%;
          left: 50%;
          animation: orbFloat 15s ease-in-out infinite 3s;
        }

        .login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1100px;
          width: 100%;
          background: var(--bg-card);
          backdrop-filter: blur(24px) saturate(1.2);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          position: relative;
          z-index: 1;
          min-height: 600px;
        }

        /* ─── Hero Side ─── */
        .login-hero {
          position: relative;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(16, 185, 129, 0.04));
        }

        .login-hero-mesh {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1), transparent 50%);
          pointer-events: none;
        }

        .login-hero-content {
          position: relative;
          z-index: 1;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .login-logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--primary), #7c3aed);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 16px var(--primary-glow);
        }

        .login-logo-text {
          font-weight: 800;
          font-size: 1.5rem;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .login-hero-title {
          font-size: clamp(2rem, 3.5vw, 2.75rem);
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #e0e7ff, #a5b4fc, #6ee7b7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-hero-subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
          line-height: 1.7;
          max-width: 420px;
        }

        .login-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .login-feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-md);
          transition: var(--transition-fast);
        }

        .login-feature-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(99, 102, 241, 0.15);
          transform: translateX(4px);
        }

        .login-feature-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          background: rgba(99, 102, 241, 0.12);
          color: var(--primary-light);
          flex-shrink: 0;
        }

        .login-feature-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-primary);
          margin-bottom: 0.1rem;
        }

        .login-feature-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* ─── Form Side ─── */
        .login-form-section {
          padding: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(6, 8, 15, 0.4);
        }

        .login-form-wrapper {
          width: 100%;
          max-width: 380px;
        }

        .login-form-header {
          margin-bottom: 2rem;
        }

        .login-form-header h2 {
          margin-bottom: 0.4rem;
        }

        .login-form-header p {
          font-size: 0.9rem;
          margin-bottom: 0;
        }

        .login-alert {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }

        .login-alert-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .login-alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .login-alert-error .login-alert-dot {
          background: #ef4444;
          animation: pulse 1.5s infinite;
        }

        .login-alert-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
        }

        .login-alert-success .login-alert-dot {
          background: #10b981;
        }

        .password-wrapper {
          position: relative;
        }

        .password-wrapper .input-field {
          padding-right: 3rem;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          transition: var(--transition-fast);
        }

        .password-toggle:hover {
          color: var(--text-primary);
        }

        .login-submit-btn {
          width: 100%;
          padding: 0.85rem;
          margin-top: 0.5rem;
          font-size: 0.95rem;
        }

        .login-switch {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .login-switch-btn {
          background: none;
          border: none;
          color: var(--primary-light);
          cursor: pointer;
          font-weight: 600;
          font-family: inherit;
          font-size: 0.9rem;
          padding: 0;
          transition: var(--transition-fast);
        }

        .login-switch-btn:hover {
          color: var(--accent-light);
          text-decoration: underline;
        }

        /* ─── Responsive ─── */
        @media (max-width: 900px) {
          .login-container {
            grid-template-columns: 1fr;
            max-width: 480px;
          }

          .login-hero {
            display: none;
          }

          .login-form-section {
            padding: 2.5rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
