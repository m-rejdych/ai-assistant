'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { invoke } from '@tauri-apps/api/tauri';
import { useAtom } from 'jotai';

import { Chat, ApiKeyInput, PromptTextarea } from '../../components/chat';
import { hasApiKeyAtom } from '../../atoms/apiKey';
import type { SendMessageData } from '../../types/chat';

export default function Home() {
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

    window.addEventListener('focus', focusInput);

    return () => {
      window.removeEventListener('focus', focusInput);
    };
  }, []);

  useEffect(() => {
    if (!hasApiKey) return;

    const findActiveChat = async (): Promise<void> => {
      if (params.get('skipActiveChatCheck') === 'true') return;

      const activeChatId = await invoke<string>('get_active_chat');
      if (activeChatId) {
        router.push(`/${activeChatId}`);
      }
    };

    findActiveChat();
  }, [hasApiKey]);

  const addNewMessages = async ({ chat: { id } }: SendMessageData): Promise<void> => {
    router.push(`/${id}`);
  };

  const handleSaveApiKey = async (isValid: boolean): Promise<void> => {
    setHasApiKey(isValid);

    if (isValid) {
      try {
        const activeChatId = await invoke('get_active_chat')
        if (activeChatId) router.push(`/${activeChatId}`);
      } catch { }
    }
  };

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
