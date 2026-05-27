"use client";
import { useState, useCallback } from "react";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

/**
 * Shared hook for admin API calls with loading/error state management.
 */
export function useAdminApi<T = unknown>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: ""
  });

  const call = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<T | null> => {
    setState({ data: null, loading: true, error: "" });
    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options
      });
      const data = await res.json();
      if (data.error) {
        setState({ data: null, loading: false, error: data.error });
        return null;
      }
      setState({ data, loading: false, error: "" });
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "请求失败";
      setState({ data: null, loading: false, error: msg });
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: "" }));
  }, []);

  return { ...state, call, clearError };
}
