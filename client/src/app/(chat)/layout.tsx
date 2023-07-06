'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { invoke } from '@tauri-apps/api/tauri';
import { useAtomValue } from 'jotai';
import { MdHistory, MdAdd } from 'react-icons/md';

import { hasApiKeyAtom } from '../../atoms/apiKey';
import type { Chat } from '../../types/chat';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const hasApiKey = useAtomValue(hasApiKeyAtom);
  const router = useRouter();
  const { chatId } = useParams();

  useEffect(() => {
    (async () => {
      try {
        setChats(await invoke<Chat[]>('get_chats'));
      } catch { }
    })();
  }, [chatId]);

  const handleSelect = (selectedId: string): void => {
    router.push(`/${selectedId}`);
  };

  if (!hasApiKey) return (
    <div className="overflow-hidden h-full px-4 py-8">
      {children}
    </div>
  );

  return (
    <div className="drawer h-full">
      <input id="chats" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content overflow-hidden h-full px-4 py-8">
        {children}
        <div className="fixed top-3 left-3 flex flex-col items-center">
          <label htmlFor="chats" className="btn btn-sm btn-square drawer-button">
            <MdHistory className="text-xl" />
          </label>
          <button className="btn btn-sm btn-square mt-2" onClick={() => router.push('/?skipActiveChatCheck=true')}>
            <MdAdd className="text-xl" />
          </button>
        </div>
      </div>
      <div className="drawer-side">
        <label htmlFor="chats" className="drawer-overlay" />
        <ul className="menu p-4 w-80 h-full bg-base-200 text-base-content">
          <li className="menu-title text-lg text-center">History</li>
          {chats.map(({ id, name }) => (
            <li key={id} className="w-full overflow-x-hidden" onClick={() => handleSelect(id)}>
              <a className={id === chatId ? 'active' : undefined}>{name}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
