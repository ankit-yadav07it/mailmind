import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/conversationService';

export function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        setStats(res?.data || res);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading };
}

export default useDashboardStats;
