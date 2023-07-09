'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { invoke } from '@tauri-apps/api/tauri';
import { isRegistered, register } from '@tauri-apps/api/globalShortcut';
import { useAtom } from 'jotai';
import { MdHistory, MdAdd } from 'react-icons/md';

import { hasApiKeyAtom } from '../../atoms/apiKey';
import type { Chat } from '../../types/chat';

const HOTKEY = 'Alt+Shift+Ctrl+A' as const;
const HOTKEY_RESIZE = 'Alt+Shift+Ctrl+S' as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [hasApiKey, setHasApiKey] = useAtom(hasApiKeyAtom);
  const [isInit, setIsInit] = useState(false);
  const router = useRouter();
  const { chatId } = useParams();

  useEffect(() => {
    const initialSetup = async (): Promise<void> => {
      try {
        await invoke('resize_window');
        if (!(await isRegistered(HOTKEY))) {
          await register(HOTKEY, async () => invoke('toggle_window'));
        }
        if (!(await isRegistered(HOTKEY_RESIZE))) {
          await register(HOTKEY_RESIZE, async () => await invoke('resize_window'));
        }

        const hasKey = await invoke<boolean>('has_api_key');

        if (hasKey) {
          const isValid = await invoke<boolean>('validate_stored_api_key');
          if (!isValid) {
            await invoke('clear_api_key');
            setHasApiKey(false);
            //          else if (params.get('skipActiveChatCheck') !== 'true') {
            //            const activeChatId = await invoke<string>('get_active_chat');
            //            if (activeChatId) {
            //              router.push(`/${activeChatId}`);
            //              setHasApiKey(true);
            //              return;
            //            }
            //
            //            setHasApiKey(true);
            //          } else {
            //            setHasApiKey(true);
            //          }
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
  }, []);

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

  if (!isInit) return null;

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
          <div className="tooltip tooltip-right" data-tip="Chat history">
            <label htmlFor="chats" className="btn btn-sm btn-square drawer-button">
              <MdHistory className="text-xl" />
            </label>
          </div>
          <div className="tooltip tooltip-right" data-tip="New chat">
            <button className="btn btn-sm btn-square mt-2" onClick={() => router.push('/?skipActiveChatCheck=true')}>
              <MdAdd className="text-xl" />
            </button>
          </div>
        </div>
      </div>
      <div className="drawer-side">
        <label htmlFor="chats" className="drawer-overlay" />
        <ul className="menu p-4 w-80 h-full bg-base-200 text-base-content">
          <li className="menu-title text-lg text-center">Chat history</li>
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
