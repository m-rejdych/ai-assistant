'use client';

import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { register, isRegistered } from '@tauri-apps/api/globalShortcut';

export default function Home() {
  const [isInit, setIsInit] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const focusInput = (): void => {
      if (!inputRef.current) return;

      inputRef.current.focus();
    };

    const initialSetup = async () => {
      await invoke('resize_window');
      if (!(await isRegistered('Alt+Shift+Ctrl+Cmd+A'))) {
        await register('Alt+Shift+Ctrl+Cmd+A', () => invoke('toggle_window'));
      }

      setHasApiKey(await invoke('has_api_key'));
      setIsInit(true);
    };

    initialSetup();

    window.addEventListener('focus', focusInput);

    return () => {
      window.removeEventListener('focus', focusInput);
    };
  }, []);

  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (e.key !== 'Enter' || !apiKeyValue) return;

    try {
      await invoke('save_api_key', { key: apiKeyValue });
      setHasApiKey(await invoke('has_api_key'));
      if (error) setError(false);
    } catch {
      setError(true);
    }
  };

  const handleChangeApiKey = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (error) setError(false);
    setApiKeyValue(e.target.value);
  };

  return (
    <main className="h-full px-4 py-8 flex flex-col">
      {isInit && hasApiKey ? (
        <>
          <div className="flex-1" />
          <textarea
            className="textarea textarea-primary resize-none"
            placeholder="Enter prompt"
            ref={inputRef}
          ></textarea>
        </>
      ) : (
        <>
          <div className="flex-1" />
          <input
            type="text"
            placeholder="Enter API key"
            className={`input input-bordered ${
              error ? 'input-error' : 'input-primary'
            } w-full`}
            value={apiKeyValue}
            onChange={handleChangeApiKey}
            onKeyDown={handleKeyDown}
          />
        </>
      )}
    </main>
  );
}
