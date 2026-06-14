// src/hooks/useApi.js
import { useState, useEffect, useCallback } from "react";

/**
 * 通用的資料載入 hook
 *
 * @param {() => Promise<any>} fetcher 一個會回傳 Promise 的函式，例如 () => getProducts()
 * @param {Array} deps 依賴陣列，變動時會重新呼叫 fetcher（同 useEffect 的 deps）
 *
 * @returns {{ data: any, loading: boolean, error: Error|null, refetch: () => void }}
 *
 * 範例：
 *   const { data: products, loading, error } = useApi(() => getProducts({ category }), [category]);
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { data, loading, error, refetch };
}
