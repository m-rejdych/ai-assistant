'use client';

import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import {
  register,
  isRegistered,
  unregister,
} from '@tauri-apps/api/globalShortcut';

import { type Message, type SendMessageData, RoleType } from '../types/chat';

const HOTKEY = 'Alt+Shift+Ctrl+A' as const;

export default function Home() {
  const [isInit, setIsInit] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingPrompt, setPendingPrompt] = useState('');
  const [error, setError] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const apiKeyRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

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
        if (!isValid) {
          await invoke('clear_api_key');
          setHasApiKey(false);
        } else {
          setMessages(await invoke<Message[]>('get_messages'));
          setHasApiKey(true);
        }
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

  useEffect(() => {
    if (!chatRef.current) return;

    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages.length, pendingPrompt]);

  const handleKeyDownApiKey = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (e.key !== 'Enter' || !apiKeyValue) return;
    e.preventDefault();

    try {
      await invoke('save_api_key', { key: apiKeyValue });
      setHasApiKey(await invoke<boolean>('has_api_key'));
      if (error) setError(false);
    } catch {
      setError(true);
    }
  };

  const handleKeyDownPrompt = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ): Promise<void> => {
    const currentPrompt = prompt.trim();

    if (e.key !== 'Enter' || e.shiftKey) return;
    if (!currentPrompt || pendingPrompt) return;
    e.preventDefault();

    setPrompt('');

    try {
      if (currentPrompt.startsWith('/')) {
        const [cmd, ...content] = currentPrompt.split(' ');

        switch (cmd) {
          case '/ctx': {
            if (!content.length) break;

            const contentStr = content.join(' ');
            setPendingPrompt(contentStr);

            await invoke('add_context_message', { content: contentStr });
            break;
          }
          default:
            break;
        }
      } else {
        setPendingPrompt(currentPrompt);

        const { userMessage, assistantMessage } = await invoke<SendMessageData>(
          'send_message',
          { content: currentPrompt },
        );
        setMessages((prev) => [...prev, userMessage, assistantMessage]);
      }
    } finally {
      setPendingPrompt('');
    }
  };

  const handleChangeApiKey = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (error) setError(false);
    setApiKeyValue(e.target.value);
  };

  const isUser = (roleType: RoleType): boolean => roleType === RoleType.User;

  const getTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const hour = date.getHours();
    const minutes = date.getMinutes();

    return `${hour > 10 ? hour : `0${hour}`}:${minutes > 10 ? minutes : `0${minutes}`
      }`;
  };

  if (!isInit) return null;

  return (
    <main className="h-full px-4 py-8 flex flex-col overflow-hidden">
      {hasApiKey ? (
        <>
          <div ref={chatRef} className="flex-1 overflow-auto">
            {messages.map(({ id, content, createdAt, role: { type } }) => (
              <div
                key={id}
                className={`chat ${isUser(type) ? 'chat-end' : 'chat-start'}`}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <div className="avatar placeholder">
                      <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                        <span className="text-xs">
                          {isUser(type) ? 'U' : 'A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="chat-header">
                  {isUser(type) ? (
                    <>
                      <time className="text-xs  opacity-50 mr-1">
                        {getTime(createdAt)}
                      </time>
                      User
                    </>
                  ) : (
                    <>
                      Assistant
                      <time className="text-xs  opacity-50 ml-1">
                        {getTime(createdAt)}
                      </time>
                    </>
                  )}
                </div>
                <div
                  className={`chat-bubble${isUser(type) ? ' chat-bubble-primary' : ''
                    }`}
                >
                  {content.split('\n').map((chunk, index) => (
                    <p className="min-h-6" key={`${id}-${index}`}>
                      {chunk}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {!!pendingPrompt && (
              <>
                <div className="chat chat-end">
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <div className="avatar placeholder">
                        <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                          <span className="text-xs">U</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="chat-header">User</div>
                  <div className="chat-bubble chat-bubble-primary">
                    {pendingPrompt}
                  </div>
                </div>
                <div className="chat chat-start">
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <div className="avatar placeholder">
                        <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                          <span className="text-xs">A</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="chat-bubble flex items-end">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce-d-sm ml-1" />
                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce-d-md ml-1" />
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="border-t border-t-accent pt-4 mt-2">
            <textarea
              className="textarea textarea-primary resize-none w-full"
              placeholder="Enter prompt"
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDownPrompt}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 overflow-auto" />
          <div className="form-control border-t border-t-accent w-full pt-4 mt-2">
            {error && (
              <label className="label">
                <span className="label-text text-error">Invalid API key</span>
              </label>
            )}
            <input
              ref={apiKeyRef}
              type="text"
              placeholder="Enter API key"
              className={`input input-bordered ${error ? 'input-error' : 'input-primary'
                } w-full`}
              value={apiKeyValue}
              onChange={handleChangeApiKey}
              onKeyDown={handleKeyDownApiKey}
            />
          </div>
        </>
      )}
    </main>
  );
}
