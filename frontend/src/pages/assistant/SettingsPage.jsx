import { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { accountService } from '../../services/accountService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Connect modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('gmail');
  const [emailInput, setEmailInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const res = await accountService.getAccounts();
      const list = res?.data?.accounts || res?.data || (Array.isArray(res) ? res : []);
      setAccounts(list);
    } catch {
      toast.error('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    try {
      setIsConnecting(true);
      const emailToUse = emailInput || `${user?.name ? user.name.toLowerCase().replace(/\s+/g, '.') : 'user'}@${selectedProvider}.com`;
      await accountService.connectAccount(selectedProvider, emailToUse);
      toast.success(`${selectedProvider === 'gmail' ? 'Google' : 'Outlook'} account connected!`);
      setIsModalOpen(false);
      setEmailInput('');
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to connect account');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await accountService.deleteAccount(id);
      setAccounts((prev) => prev.filter((a) => a._id !== id));
      toast.success('Account disconnected');
    } catch {
      toast.error('Failed to remove account');
    }
  };

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-h)', margin: 0 }}>
          Settings & Connected Accounts
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-m)', marginTop: '4px', margin: 0 }}>
          Manage your email provider integrations and assistant profile preferences
        </p>
      </div>

      {/* Section 1: Connected Accounts */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-h)', margin: 0 }}>
              Connected Email Inboxes
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-m)', marginTop: '2px', margin: 0 }}>
              Accounts actively being ingested and analyzed
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={14} />}
            onClick={() => setIsModalOpen(true)}
          >
            Connect Account
          </Button>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton height={50} />
            <Skeleton height={50} />
          </div>
        ) : accounts.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-m)' }}>
            <p style={{ fontSize: '14px', marginBottom: '12px' }}>No accounts currently linked.</p>
            <Button size="sm" variant="primary" onClick={() => setIsModalOpen(true)}>
              Connect Your First Account
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {accounts.map((acc) => {
              const isGmail = acc.provider === 'gmail';
              return (
                <div
                  key={acc._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        backgroundColor: isGmail ? '#EA4335' : '#0078D4',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '15px',
                      }}
                    >
                      {isGmail ? 'G' : 'O'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-h)' }}>
                        {acc.emailAddress || acc.email}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-m)', textTransform: 'capitalize' }}>
                        {acc.provider || 'Email Provider'} • {acc.isSimulated ? 'Simulated Sync' : 'Live Sync'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        backgroundColor: 'var(--success-lt)',
                        color: 'var(--success)',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={12} /> Active
                    </span>

                    <button
                      onClick={() => handleDeleteAccount(acc._id)}
                      title="Disconnect account"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Profile */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '16px' }}>
          Assistant Identity & Role
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-m)', marginBottom: '4px' }}>
              Full Name
            </label>
            <input
              type="text"
              readOnly
              value={user?.name || ''}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                fontSize: '14px',
                color: 'var(--text-b)',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-m)', marginBottom: '4px' }}>
              Email Address
            </label>
            <input
              type="text"
              readOnly
              value={user?.email || ''}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                fontSize: '14px',
                color: 'var(--text-b)',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-m)', marginBottom: '4px' }}>
              System Role
            </label>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'var(--accent-lt)',
                color: 'var(--accent)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '13px',
                textTransform: 'capitalize',
              }}
            >
              <Shield size={14} /> {user?.role || 'assistant'}
            </span>
          </div>
        </div>
      </div>

      {/* Connect Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connect Email Account"
        size="md"
      >
        <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '8px' }}>
              Select Provider
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                onClick={() => setSelectedProvider('gmail')}
                style={{
                  border: `2px solid ${selectedProvider === 'gmail' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  cursor: 'pointer',
                  backgroundColor: selectedProvider === 'gmail' ? 'var(--accent-lt)' : 'var(--bg)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#EA4335' }}>Google Workspace</div>
                <div style={{ fontSize: '11px', color: 'var(--text-m)' }}>Gmail & Google Calendar</div>
              </div>

              <div
                onClick={() => setSelectedProvider('outlook')}
                style={{
                  border: `2px solid ${selectedProvider === 'outlook' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  cursor: 'pointer',
                  backgroundColor: selectedProvider === 'outlook' ? 'var(--accent-lt)' : 'var(--bg)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#0078D4' }}>Microsoft 365</div>
                <div style={{ fontSize: '11px', color: 'var(--text-m)' }}>Outlook & Exchange</div>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '6px' }}>
              Account Email (Optional or Simulated)
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={`user@${selectedProvider}.com`}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isConnecting}>
              Connect Inbox
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
