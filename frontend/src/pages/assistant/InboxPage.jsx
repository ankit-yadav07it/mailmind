import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { conversationService } from '../../services/conversationService';
import EmailList from '../../components/email/EmailList';
import toast from 'react-hot-toast';

export default function InboxPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const debounceTimeout = useRef(null);

  // Sync state to URL search params
  const updateParams = (newSearch, newFilter, newSort) => {
    const params = {};
    if (newSearch) params.search = newSearch;
    if (newFilter && newFilter !== 'all') params.filter = newFilter;
    if (newSort && newSort !== 'newest') params.sort = newSort;
    setSearchParams(params, { replace: true });
  };

  const fetchEmails = async (isLoadMore = false) => {
    try {
      setIsLoading(true);
      const queryPage = isLoadMore ? page + 1 : 1;
      const apiParams = {
        page: queryPage,
        limit: 15,
        search: searchTerm || undefined,
        sort,
      };

      if (filter === 'unread') apiParams.isRead = false;
      if (filter === 'important') apiParams.isImportant = true;
      if (filter === 'action') apiParams.requiresAction = true;

      const res = await conversationService.getConversations(apiParams);
      const list = res?.data?.conversations || res?.conversations || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      const total = res?.data?.total || res?.total || list.length;

      if (isLoadMore) {
        setConversations((prev) => [...prev, ...list]);
        setPage(queryPage);
      } else {
        setConversations(list);
        setPage(1);
      }

      setHasNextPage(list.length === 15 && total > queryPage * 15);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load inbox emails');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      updateParams(searchTerm, filter, sort);
      fetchEmails(false);
    }, 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchTerm, filter, sort]);

  const handleToggleStar = async (id, isImportant) => {
    try {
      await conversationService.updateConversation(id, { isImportant });
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isImportant } : c))
      );
      toast.success(isImportant ? 'Starred' : 'Unstarred');
    } catch {
      toast.error('Failed to update email');
    }
  };

  const handleToggleArchive = async (id) => {
    try {
      await conversationService.updateConversation(id, { isArchived: true });
      setConversations((prev) => prev.filter((c) => c._id !== id));
      toast.success('Archived');
    } catch {
      toast.error('Failed to archive email');
    }
  };

  const handleToggleRead = async (id, isRead) => {
    try {
      await conversationService.updateConversation(id, { isRead });
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isRead } : c))
      );
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title + Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-h)', margin: 0 }}>
              Inbox
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-m)', marginTop: '2px', margin: 0 }}>
              All executive conversations synced across connected channels
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            background: 'var(--surface)',
            padding: '12px 16px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Search box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-m)',
              }}
            />
            <input
              type="text"
              placeholder="Filter by subject or sender..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'important', label: 'Important' },
              { id: 'action', label: 'Action Required' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setFilter(chip.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '100px',
                  border: `1px solid ${filter === chip.id ? 'var(--accent)' : 'var(--border)'}`,
                  backgroundColor: filter === chip.id ? 'var(--accent-lt)' : 'transparent',
                  color: filter === chip.id ? 'var(--accent)' : 'var(--text-b)',
                  fontSize: '12px',
                  fontWeight: filter === chip.id ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={14} color="var(--text-m)" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                fontSize: '13px',
                color: 'var(--text-b)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Email List */}
      <EmailList
        conversations={conversations}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        onLoadMore={() => fetchEmails(true)}
        onToggleStar={handleToggleStar}
        onToggleArchive={handleToggleArchive}
        onToggleRead={handleToggleRead}
      />
    </div>
  );
}
