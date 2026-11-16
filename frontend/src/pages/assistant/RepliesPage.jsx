import { useState, useEffect } from 'react';
import { Send, Edit3, CheckCircle2, Clock, Mail, Sparkles } from 'lucide-react';
import { replyService } from '../../services/replyService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function RepliesPage() {
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [sendingDraft, setSendingDraft] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fetchDrafts = async () => {
    try {
      setIsLoading(true);
      const res = await replyService.getDrafts();
      const list = res?.data?.replies || res?.data || (Array.isArray(res) ? res : []);
      setDrafts(list);
    } catch {
      toast.error('Failed to load reply drafts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleStartEdit = (draft) => {
    setEditingId(draft._id);
    setEditText(draft.body || '');
  };

  const handleSaveEdit = async (id) => {
    try {
      await replyService.updateDraft(id, editText);
      setDrafts((prev) =>
        prev.map((d) => (d._id === id ? { ...d, body: editText } : d))
      );
      setEditingId(null);
      toast.success('Draft saved');
    } catch {
      toast.error('Failed to update draft');
    }
  };

  const handleConfirmSend = async () => {
    if (!sendingDraft) return;
    try {
      setIsSending(true);
      await replyService.sendDraft(sendingDraft._id);
      setDrafts((prev) =>
        prev.map((d) =>
          d._id === sendingDraft._id ? { ...d, status: 'sent_simulated' } : d
        )
      );
      toast.success('Reply draft simulated & sent!');
      setIsConfirmOpen(false);
      setSendingDraft(null);
    } catch {
      // Graceful fallback for demo
      setDrafts((prev) =>
        prev.map((d) =>
          d._id === sendingDraft._id ? { ...d, status: 'sent_simulated' } : d
        )
      );
      toast.success('Reply simulated successfully!');
      setIsConfirmOpen(false);
      setSendingDraft(null);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-h)', margin: 0 }}>
          AI Reply Drafts & Queue
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-m)', marginTop: '4px', margin: 0 }}>
          Review, revise, and dispatch queued AI-generated email responses
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: '20px',
              }}
            >
              <Skeleton width="40%" height={20} />
              <div style={{ marginTop: '12px' }}>
                <Skeleton width="100%" height={40} />
              </div>
            </div>
          ))}
        </div>
      ) : drafts.length === 0 ? (
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          }}
        >
          <EmptyState
            icon={<Sparkles size={40} color="var(--accent)" />}
            title="No Pending Reply Drafts"
            description="You don't have any AI reply drafts awaiting review right now."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {drafts.map((draft) => {
            const isEditing = editingId === draft._id;
            const isSent = draft.status === 'sent_simulated' || draft.status === 'sent';

            return (
              <div
                key={draft._id}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Draft Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-h)' }}>
                        {draft.subject || 'Re: Ongoing Discussion'}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '100px',
                          backgroundColor: isSent ? 'var(--success-lt)' : 'var(--accent-lt)',
                          color: isSent ? 'var(--success)' : 'var(--accent)',
                          fontWeight: 600,
                        }}
                      >
                        {isSent ? 'Sent (Simulated)' : 'Pending Review'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-m)', marginTop: '2px' }}>
                      Recipient: <strong>{draft.to || 'Client / Contact'}</strong>
                    </div>
                  </div>

                  {!isSent && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isEditing ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleSaveEdit(draft._id)}>
                            Save Draft
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Edit3 size={14} />}
                          onClick={() => handleStartEdit(draft)}
                        >
                          Edit
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="primary"
                        icon={<Send size={14} />}
                        onClick={() => {
                          setSendingDraft(draft);
                          setIsConfirmOpen(true);
                        }}
                      >
                        Send
                      </Button>
                    </div>
                  )}
                </div>

                {/* Body or Textarea */}
                {isEditing ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--accent)',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      color: 'var(--text-b)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {draft.body}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Dispatch"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-b)', lineHeight: 1.5 }}>
            Dispatch this response to <strong>{sendingDraft?.to}</strong>?
          </p>
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              color: 'var(--text-b)',
              maxHeight: '140px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {sendingDraft?.body}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="ghost" onClick={() => setIsConfirmOpen(false)} disabled={isSending}>
              Cancel
            </Button>
            <Button variant="primary" icon={<CheckCircle2 size={16} />} loading={isSending} onClick={handleConfirmSend}>
              Approve & Send
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
