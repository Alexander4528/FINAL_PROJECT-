import { useState, useEffect, useCallback } from 'react';

const useInfiniteScroll = (fetchMore, hasMore, isLoading) => {
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(() => {
    if (isFetching || isLoading || !hasMore) return;

    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // Load more when 80% from bottom
    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      setIsFetching(true);
      setPage(prev => prev + 1);
    }
  }, [isFetching, isLoading, hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isFetching && hasMore) {
      fetchMore(page).finally(() => setIsFetching(false));
    }
  }, [isFetching, page, fetchMore, hasMore]);

  const reset = useCallback(() => {
    setPage(1);
    setIsFetching(false);
  }, []);

  return { isFetching, reset };
};

export default useInfiniteScroll;