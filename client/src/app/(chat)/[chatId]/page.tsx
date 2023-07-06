'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { invoke } from '@tauri-apps/api/tauri';

import { Chat, PromptTextarea } from '../../../components/chat';
import { type Message, type SendMessageData } from '../../../types/chat';

export default function Home() {
  const [pendingPrompt, setPendingPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { chatId } = useParams();
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    (async () => {
      setMessages(await invoke<Message[]>('get_messages_by_chat_id', { chatId }));
    })();

    const focusInput = (): void => {
      if (promptRef.current) promptRef.current.focus();
    };

    window.addEventListener('focus', focusInput);

    return () => {
      window.removeEventListener('focus', focusInput);
    };
  }, []);

  const addNewMessages = ({ userMessage, assistantMessage }: SendMessageData): void =>
    setMessages((prev) => [...prev, userMessage, assistantMessage]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Chat pendingPrompt={pendingPrompt} messages={messages} className="flex-1 overflow-auto" />
      <PromptTextarea
        ref={promptRef}
        pendingPrompt={pendingPrompt}
        onPendingPrompt={setPendingPrompt}
        onSend={addNewMessages}
      />
    </div>
  );
}
