import { useState, useCallback } from 'react';

const KEY = 'velixora_openai_key';

export function useApiKey() {
  const [key, setKeyState] = useState(() => localStorage.getItem(KEY) || '');

  const saveKey = useCallback((k: string) => {
    localStorage.setItem(KEY, k);
    setKeyState(k);
  }, []);

  const removeKey = useCallback(() => {
    localStorage.removeItem(KEY);
    setKeyState('');
  }, []);

  return { key, saveKey, removeKey, hasKey: !!key };
}
