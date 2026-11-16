import { useState, useEffect, useCallback } from 'react';
import { getConversations } from '../services/conversationService';

export function useConversations(params = {}) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getConversations(params);
      const list = data?.data?.conversations || data?.conversations || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
      setConversations(list);
      setTotal(data?.data?.total || data?.total || list.length);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { conversations, isLoading, error, total, refetch: fetch };
}

export default useConversations;
