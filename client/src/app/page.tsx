'use client';

import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import {
  register,
  isRegistered,
  unregister,
} from '@tauri-apps/api/globalShortcut';

const HOTKEY = 'Alt+Shift+Ctrl+A' as const;

export default function Home() {
  const [isInit, setIsInit] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [error, setError] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const apiKeyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusInput = (): void => {
      if (promptRef.current) promptRef.current.focus();
      else if (apiKeyRef.current) apiKeyRef.current.focus();
    };

    const initialSetup = async () => {
      await invoke('resize_window');
      await unregister('Alt+Shift+Ctrl+Cmd+A');
      if (!(await isRegistered(HOTKEY))) {
        await register(HOTKEY, async () => invoke('toggle_window'));
      }

      const hasApiKey = await invoke<boolean>('has_api_key');

      if (hasApiKey) {
        const isValid = await invoke<boolean>('validate_stored_api_key');
        if (!isValid) await invoke('clear_api_key');
        setHasApiKey(isValid);
      } else {
        setHasApiKey(false);
      }

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
      setHasApiKey(await invoke<boolean>('has_api_key'));
      if (error) setError(false);
    } catch {
      setError(true);
    }
  };

  const handleChangeApiKey = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (error) setError(false);
    setApiKeyValue(e.target.value);
  };

  if (!isInit) return null;

  return (
    <main className="h-full px-4 py-8 flex flex-col">
      {hasApiKey ? (
        <>
          <div className="flex-1" />
          <textarea
            className="textarea textarea-primary resize-none"
            placeholder="Enter prompt"
            ref={promptRef}
          ></textarea>
        </>
      ) : (
        <>
          <div className="flex-1" />
          <div className="form-control w-full">
            {error && (
              <label className="label">
                <span className="label-text text-error">Invalid API key</span>
              </label>
            )}
            <input
              ref={apiKeyRef}
              type="text"
              placeholder="Enter API key"
              className={`input input-bordered ${
                error ? 'input-error' : 'input-primary'
              } w-full`}
              value={apiKeyValue}
              onChange={handleChangeApiKey}
              onKeyDown={handleKeyDown}
            />
          </div>
        </>
      )}
    </main>
  );
}
