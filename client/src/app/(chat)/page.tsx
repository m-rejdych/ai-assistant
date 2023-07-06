'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { invoke } from '@tauri-apps/api/tauri';
import { register, isRegistered } from '@tauri-apps/api/globalShortcut';
import { useAtom } from 'jotai';

import { Chat, ApiKeyInput, PromptTextarea } from '../../components/chat';
import { hasApiKeyAtom } from '../../atoms/apiKey';
import type { SendMessageData } from '../../types/chat';

const HOTKEY = 'Alt+Shift+Ctrl+A' as const;
const HOTKEY_RESIZE = 'Alt+Shift+Ctrl+S' as const;

export default function Home() {
  const [isInit, setIsInit] = useState(false);
  const [hasApiKey, setHasApiKey] = useAtom(hasApiKeyAtom);
  const [pendingPrompt, setPendingPrompt] = useState('');
  const router = useRouter();
  const params = useSearchParams();
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const apiKeyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusInput = (): void => {
      if (promptRef.current) promptRef.current.focus();
      else if (apiKeyRef.current) apiKeyRef.current.focus();
    };

    const initialSetup = async () => {
      try {
        await invoke('resize_window');
        if (!(await isRegistered(HOTKEY))) {
          await register(HOTKEY, async () => invoke('toggle_window'));
        }
        if (!(await isRegistered(HOTKEY_RESIZE))) {
          await register(HOTKEY_RESIZE, async () => await invoke('resize_window'));
        }

        const hasApiKey = await invoke<boolean>('has_api_key');

        if (hasApiKey) {
          const isValid = await invoke<boolean>('validate_stored_api_key');
          if (!isValid) {
            await invoke('clear_api_key');
            setHasApiKey(false);
          } else if (params.get('skipActiveChatCheck') !== 'true') {
            const activeChatId = await invoke<string>('get_active_chat');
            if (activeChatId) {
              router.push(`/${activeChatId}`);
              setHasApiKey(true);
              return;
            }

            setHasApiKey(true);
          } else {
            setHasApiKey(true);
          }
        } else {
          setHasApiKey(false);
        }

        setIsInit(true);
      } catch { }
    };

    initialSetup();

    window.addEventListener('focus', focusInput);

    return () => {
      window.removeEventListener('focus', focusInput);
    };
  }, []);

  const addNewMessages = async ({ chat: { id } }: SendMessageData): Promise<void> => {
    router.push(`/${id}`);
  };

  const handleSaveApiKey = async (isValid: boolean): Promise<void> => {
    if (!isValid) setHasApiKey(false);
    else {
      try {
        const activeChatId = await invoke('get_active_chat')
        if (activeChatId) router.push(`/${activeChatId}`);
        else setHasApiKey(true);
      } catch { }
    }
  };

  if (!isInit) return null;

  return (
    <main className="h-full flex flex-col overflow-hidden">
      {hasApiKey ? (
        <>
          <Chat pendingPrompt={pendingPrompt} messages={[]} className="flex-1 overflow-auto" />
          <PromptTextarea
            ref={promptRef}
            pendingPrompt={pendingPrompt}
            onPendingPrompt={setPendingPrompt}
            onSend={addNewMessages}
          />
        </>
      ) : (
        <>
          <div className="flex-1 overflow-auto" />
          <ApiKeyInput ref={apiKeyRef} onSave={handleSaveApiKey} />
        </>
      )}
    </main>
  );
}
