import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, ShieldCheck, Zap, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { accountService } from '../../services/accountService';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user?.role === 'client') {
        navigate('/client/dashboard');
      } else {
        // Assistant flow: check if connected accounts exist
        try {
          const accRes = await accountService.getAccounts();
          const accounts = accRes.data?.accounts || accRes.data || [];
          if (accounts.length === 0) {
            navigate('/onboarding');
          } else {
            navigate('/assistant/dashboard');
          }
        } catch {
          navigate('/assistant/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-layout">
      {/* Left panel */}
      <div
        className="split-left"
        style={{
          backgroundColor: 'var(--primary)',
          color: '#FFFFFF',
          padding: '60px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 700 }}>
            <span style={{ color: 'var(--accent)' }}>✦</span> MailMind
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
            Next-Gen Executive Inbox OS
          </div>
        </div>

        <div style={{ maxWidth: '420px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1.3, marginBottom: '16px' }}>
            AI-powered email management for high-performing teams & assistants.
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6, marginBottom: '32px' }}>
            Triage, summarize, categorize, and draft intelligent context-aware replies with human-in-the-loop confidence.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: Sparkles, text: 'Instant classification between assistant action & client decision' },
              { icon: Zap, text: 'Automated high-precision AI summaries and calendar event detection' },
              { icon: ShieldCheck, text: 'Complete client portal with one-click approval & takeover' },
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(79, 124, 255, 0.15)',
                    padding: '8px',
                    borderRadius: '8px',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <feature.icon size={18} />
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)' }}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
          © 2026 MailMind AI Systems. All rights reserved.
        </div>
      </div>

      {/* Right panel */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '60px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-m)' }}>
              Sign in to your MailMind workspace to continue.
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--danger-lt)',
                color: 'var(--danger)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                marginBottom: '20px',
                border: '1px solid rgba(220, 38, 38, 0.2)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '6px' }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '14px',
                  backgroundColor: 'var(--bg)',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontSize: '14px',
                    backgroundColor: 'var(--bg)',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-m)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              style={{ width: '100%', marginTop: '8px' }}
              icon={<ArrowRight size={16} />}
            >
              Sign In
            </Button>
          </form>

          {/* Demo credentials box */}
          <div
            style={{
              marginTop: '28px',
              padding: '16px',
              backgroundColor: 'var(--accent-lt)',
              border: '1px dashed var(--accent)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} /> Quick Demo Access:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                onClick={() => handleDemoFill('assistant@demo.com', 'Demo1234!')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  border: '1px solid rgba(79, 124, 255, 0.2)',
                }}
              >
                <span><strong>Assistant:</strong> assistant@demo.com</span>
                <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Use</span>
              </div>
              <div
                onClick={() => handleDemoFill('client@demo.com', 'Demo1234!')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  border: '1px solid rgba(79, 124, 255, 0.2)',
                }}
              >
                <span><strong>Client:</strong> client@demo.com</span>
                <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Use</span>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-m)', marginTop: '6px', textAlign: 'center' }}>
              Password for both: <code>Demo1234!</code>
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-m)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--accent)' }}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
