import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabasePaginated<T>(
  table: string, 
  { pageSize = 20, orderBy = 'created_at', ascending = false }: { pageSize?: number, orderBy?: string, ascending?: boolean } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(0);

  const fetchData = useCallback(async (isNewPage: boolean = false) => {
    if (loadingRef.current || (!hasMoreRef.current && isNewPage)) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    const currentPage = isNewPage ? pageRef.current + 1 : 0;
    const from = currentPage * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data: fetchedData, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .order(orderBy, { ascending })
        .range(from, to);

      if (fetchError) throw fetchError;

      if (isNewPage) {
        setData(prev => [...prev, ...(fetchedData || [])]);
      } else {
        setData(fetchedData || []);
      }

      pageRef.current = currentPage;
      const more = fetchedData ? fetchedData.length === pageSize : false;
      hasMoreRef.current = more;
      setHasMore(more);
    } catch (err: any) {
      setError(err.message);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [table, pageSize, orderBy, ascending]);

  useEffect(() => {
    fetchData(false);
  }, [table, fetchData]);

  return { data, loading, error, hasMore, fetchMore: () => fetchData(true), refresh: () => fetchData(false) };
}
