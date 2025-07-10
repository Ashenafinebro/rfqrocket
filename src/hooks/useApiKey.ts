import { useState, useEffect } from 'react';

export const useApiKey = () => {
  // This hook is now deprecated since we moved to Supabase edge functions
  // Keeping for backward compatibility but always returns false
  const [apiKey, setApiKey] = useState<string>('');
  const [hasKey, setHasKey] = useState<boolean>(false);

  const refreshApiKey = () => {
    // No longer needed - API key is now stored in Supabase secrets
    setApiKey('');
    setHasKey(false);
  };

  return {
    apiKey: '',
    hasKey: false,
    refreshApiKey
  };
};
