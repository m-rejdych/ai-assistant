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
  const [loading, setLoading] = useState(false);
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
        try {
          setLoading(true);
          setMessages(await invoke<Message[]>('get_messages_by_chat_id', { chatId }));
        } catch (error) {
          console.log(error);
        }

        setLoading(false);
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

  const handleSaveApiKey = (isValid: boolean): void => {
    setHasApiKey(isValid);
  };

  return (
    <main className="h-full flex flex-col overflow-hidden">
      {hasApiKey ? (
        <>
          {loading ? (
            <div className="flex-1 self-center">
              <progress className="progress progress-primary w-56" />
            </div>
          ) : (
            <Messages
              pendingPrompt={pendingPrompt}
              messages={messages}
              className="flex-1 overflow-auto"
            />
          )}
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
          <div className="flex-1 self-center">
            {loading && <progress className="progress progress-primary w-56" />}
          </div>
          <ApiKeyInput ref={apiKeyRef} onSave={handleSaveApiKey} onLoading={setLoading} />
        </>
      )}
    </main>
  );
};
