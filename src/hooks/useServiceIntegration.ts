
import { useState, useEffect } from 'react';
import { ApiResponse } from '@/services/api';

export function useServiceCall<T>(
  serviceCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await serviceCall();
        
        if (isMounted) {
          if (response.success) {
            setData(response.data);
          } else {
            setError(response.message || 'An error occurred');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => {
    const fetchData = async () => {
      const response = await serviceCall();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'An error occurred');
      }
    };
    fetchData();
  }};
}

export function useAsyncServiceCall<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (serviceCall: () => Promise<ApiResponse<T>>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await serviceCall();
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'An error occurred');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}
