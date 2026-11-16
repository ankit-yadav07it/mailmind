import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Mail, Sparkles, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { accountService } from '../../services/accountService';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [connectedProviders, setConnectedProviders] = useState({});
  const [connecting, setConnecting] = useState({});
  const [syncProgress, setSyncProgress] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleConnect = async (provider) => {
    try {
      setConnecting((prev) => ({ ...prev, [provider]: true }));
      const email = `${user?.name ? user.name.toLowerCase().replace(/\s+/g, '.') : 'user'}@${provider}.com`;
      await accountService.connectAccount(provider, email);
      
      setConnectedProviders((prev) => ({ ...prev, [provider]: email }));
      toast.success(`${provider === 'gmail' ? 'Google Workspace' : 'Microsoft Outlook'} connected!`);

      // Simulated sync animation
      setSyncProgress(10);
      const interval = setInterval(() => {
        setSyncProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + 30;
        });
      }, 300);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to connect ${provider}`);
    } finally {
      setConnecting((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const hasAtLeastOneConnection = Object.keys(connectedProviders).length > 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          padding: '40px',
        }}
      >
        {/* Progress header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: step === s ? 'var(--accent)' : step > s ? 'var(--success)' : 'var(--border)',
                  color: step >= s ? '#FFFFFF' : 'var(--text-m)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                {step > s ? <Check size={16} /> : s}
              </div>
              {s < 3 && (
                <div
                  style={{
                    width: 48,
                    height: 2,
                    backgroundColor: step > s ? 'var(--success)' : 'var(--border)',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-lt)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <Sparkles size={32} />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '12px' }}>
              Welcome, {user?.name || 'Assistant'}!
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-m)', lineHeight: 1.6, marginBottom: '32px' }}>
              MailMind helps you organize, triage, and draft high-context executive replies with AI precision.
              Let's connect your email inboxes to get started.
            </p>

            <Button
              variant="primary"
              size="lg"
              style={{ width: '100%' }}
              icon={<ArrowRight size={18} />}
              onClick={() => setStep(2)}
            >
              Get Started
            </Button>
          </div>
        )}

        {/* Step 2: Connect */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
                Connect Your Inboxes
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-m)' }}>
                Connect at least one provider to simulate automated sync and classification.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              {/* Gmail */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: connectedProviders.gmail ? 'var(--success-lt)' : 'var(--surface)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      backgroundColor: '#EA4335',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '18px',
                    }}
                  >
                    G
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-h)' }}>
                      Google Workspace / Gmail
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-m)' }}>
                      {connectedProviders.gmail || 'Direct API integration'}
                    </div>
                  </div>
                </div>

                {connectedProviders.gmail ? (
                  <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={16} /> Connected
                  </span>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={connecting.gmail}
                    onClick={() => handleConnect('gmail')}
                  >
                    Connect
                  </Button>
                )}
              </div>

              {/* Outlook */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: connectedProviders.outlook ? 'var(--success-lt)' : 'var(--surface)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      backgroundColor: '#0078D4',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '18px',
                    }}
                  >
                    O
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-h)' }}>
                      Microsoft 365 / Outlook
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-m)' }}>
                      {connectedProviders.outlook || 'Enterprise Graph API integration'}
                    </div>
                  </div>
                </div>

                {connectedProviders.outlook ? (
                  <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={16} /> Connected
                  </span>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={connecting.outlook}
                    onClick={() => handleConnect('outlook')}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>

            {/* Sync feedback */}
            {hasAtLeastOneConnection && (
              <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-m)', marginBottom: '6px' }}>
                  <span>✓ Simulated Connection Active</span>
                  <span>Syncing historical threads ({syncProgress}%)</span>
                </div>
                <div style={{ width: '100%', height: 4, backgroundColor: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${syncProgress}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                style={{ flex: 1 }}
                disabled={!hasAtLeastOneConnection}
                onClick={() => setStep(3)}
              >
                Continue to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Ready */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'var(--success-lt)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '10px' }}>
              You're All Set!
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-m)', lineHeight: 1.6, marginBottom: '24px' }}>
              Your inbox has been connected and your initial email threads have been synced & pre-analyzed with AI classification.
            </p>

            <div
              style={{
                backgroundColor: 'var(--bg)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                marginBottom: '28px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-m)' }}>Accounts Connected:</span>
                <span style={{ fontWeight: 600 }}>{Object.keys(connectedProviders).length} provider(s)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-m)' }}>Initial Threads Processed:</span>
                <span style={{ fontWeight: 600 }}>12 conversations</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-m)' }}>AI Classification Model:</span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Active (Dual-tier)</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              style={{ width: '100%' }}
              icon={<ArrowRight size={18} />}
              onClick={() => navigate('/assistant/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
