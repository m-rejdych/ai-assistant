import { useEffect, useRef, useState, type FC } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useAtom } from 'jotai';

import { ApiKeyInput } from './ApiKeyInput';
import { PromptTextarea } from './PromptTextarea';
import { Messages } from './Messages';
import { hasApiKeyAtom } from '../../atoms/apiKey';
import type { SendMessageData, Message } from '../../types/chat';

interface Props {
  chatId: string;
  onNewChat: (id: string) => void;
}

export const Chat: FC<Props> = ({ chatId, onNewChat }) => {
  const [hasApiKey, setHasApiKey] = useAtom(hasApiKeyAtom);
  const [pendingPrompt, setPendingPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
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
  }, [hasApiKey]);

  useEffect(() => {
    if (chatId) {
      (async () => {
        setMessages(await invoke<Message[]>('get_messages_by_chat_id', { chatId }));
      })();
    } else {
      setMessages([]);
    }
  }, [chatId]);

  const addNewMessages = ({
    chat: { id },
    userMessage,
    assistantMessage,
  }: SendMessageData): void => {
    if (chatId) {
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
    } else {
      onNewChat(id);
    }
  };

  const handleSaveApiKey = async (isValid: boolean): Promise<void> => {
    setHasApiKey(isValid);

    if (isValid) {
      try {
        const activeChatId = await invoke<string>('get_active_chat');
        if (activeChatId) onNewChat(activeChatId);
      } catch {}
    }
  };

  return (
    <main className="h-full flex flex-col overflow-hidden">
      {hasApiKey ? (
        <>
          <Messages
            pendingPrompt={pendingPrompt}
            messages={messages}
            className="flex-1 overflow-auto"
          />
          <PromptTextarea
            chatId={chatId}
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
};
