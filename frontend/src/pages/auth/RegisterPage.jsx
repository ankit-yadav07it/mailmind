import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, UserCheck, Shield, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('assistant');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register(name, email, password, role);
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
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
            Elevate executive email workflows to autonomous precision.
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6, marginBottom: '24px' }}>
            Join assistants and executives who delegate routine administrative email tasks with zero friction.
          </p>
        </div>

        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
          © 2026 MailMind AI Systems. All rights reserved.
        </div>
      </div>

      {/* Right panel */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
              Create your account
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-m)' }}>
              Get started with your intelligent email dashboard.
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Jenkins"
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
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
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
                  placeholder="At least 6 characters"
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

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '8px' }}>
                Select your role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div
                  onClick={() => setRole('assistant')}
                  style={{
                    border: `2px solid ${role === 'assistant' ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                    cursor: 'pointer',
                    backgroundColor: role === 'assistant' ? 'var(--accent-lt)' : 'var(--bg)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: role === 'assistant' ? 'var(--accent)' : 'var(--text-h)', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                    <UserCheck size={16} />
                    Personal Assistant
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-m)', lineHeight: 1.4 }}>
                    Manage client inboxes, draft AI replies, triage emails.
                  </div>
                </div>

                <div
                  onClick={() => setRole('client')}
                  style={{
                    border: `2px solid ${role === 'client' ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                    cursor: 'pointer',
                    backgroundColor: role === 'client' ? 'var(--accent-lt)' : 'var(--bg)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: role === 'client' ? 'var(--accent)' : 'var(--text-h)', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                    <Shield size={16} />
                    Executive Client
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-m)', lineHeight: 1.4 }}>
                    Review emails requiring your personal attention only.
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              style={{ width: '100%', marginTop: '10px' }}
              icon={<ArrowRight size={16} />}
            >
              Create Account
            </Button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-m)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--accent)' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
