import { useState } from 'react';
import { Sparkles, RefreshCw, Calendar, CheckCircle2, ChevronDown } from 'lucide-react';
import ClassificationBadge from './ClassificationBadge';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';

const CLASSIFICATION_OPTIONS = [
  { value: 'ASSISTANT_TO_REPLY', label: 'Assistant to Reply' },
  { value: 'CLIENT_TO_REPLY', label: 'Client to Reply' },
  { value: 'NO_REPLY_NEEDED', label: 'No Reply Needed' },
  { value: 'NEEDS_REVIEW', label: 'Needs Review' },
];

export default function AIAnalysisPanel({
  analysis,
  isLoading = false,
  onRegenerate,
  onChangeClassification,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (isLoading) {
    return (
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Skeleton width={20} height={20} circle />
          <Skeleton width={140} height={18} />
        </div>
        <Skeleton width="100%" height={24} />
        <Skeleton width="100%" height={60} />
        <Skeleton width="100%" height={80} />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-m)' }}>
        <Sparkles size={28} style={{ margin: '0 auto 12px', color: 'var(--accent)', opacity: 0.8 }} />
        <p style={{ fontSize: '14px', marginBottom: '16px' }}>No AI analysis yet for this conversation.</p>
        <Button size="sm" variant="secondary" icon={<Sparkles size={14} />} onClick={onRegenerate}>
          Analyze Conversation
        </Button>
      </div>
    );
  }

  const {
    classification = 'NEEDS_REVIEW',
    confidence = 0.85,
    reason = '',
    summary = '',
    extractedEvents = [],
  } = analysis;

  const confidencePct = Math.round((confidence || 0) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--accent)" />
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-h)' }}>
            AI Intelligence
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          icon={<RefreshCw size={14} />}
          onClick={onRegenerate}
          title="Regenerate Analysis"
        >
          Re-analyze
        </Button>
      </div>

      {/* Classification Card */}
      <div
        style={{
          backgroundColor: 'var(--bg)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-m)', textTransform: 'uppercase' }}>
            Classification
          </span>

          {/* Classification Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '4px',
              }}
            >
              <ClassificationBadge classification={classification} />
              <ChevronDown size={14} color="var(--text-m)" />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '4px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 20,
                  width: '180px',
                  padding: '4px 0',
                }}
              >
                {CLASSIFICATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setDropdownOpen(false);
                      onChangeClassification && onChangeClassification(opt.value);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      color: 'var(--text-b)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span>{opt.label}</span>
                    {classification === opt.value && <CheckCircle2 size={14} color="var(--accent)" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Confidence bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-m)', marginBottom: '4px' }}>
            <span>Confidence</span>
            <span>{confidencePct}%</span>
          </div>
          <div style={{ width: '100%', height: 6, backgroundColor: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                width: `${confidencePct}%`,
                height: '100%',
                backgroundColor: confidencePct > 70 ? 'var(--accent)' : 'var(--warning)',
                borderRadius: 3,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* AI Reason */}
        {reason && (
          <p style={{ fontSize: '13px', color: 'var(--text-b)', lineHeight: 1.5, margin: 0 }}>
            <span style={{ fontWeight: 600 }}>Why: </span>
            {reason}
          </p>
        )}
      </div>

      {/* Summary Section */}
      {summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-m)', textTransform: 'uppercase' }}>
            Executive Summary
          </span>
          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--accent-lt)',
              borderLeft: '4px solid var(--accent)',
              borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-b)',
            }}
          >
            {summary}
          </div>
        </div>
      )}

      {/* Extracted Events Section */}
      {extractedEvents && extractedEvents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-m)', textTransform: 'uppercase' }}>
            Key Dates & Events
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {extractedEvents.map((evt, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                  }}
                >
                  <Calendar size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)' }}>
                    {evt.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-m)' }}>
                    {evt.date} {evt.type ? `• ${evt.type}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
