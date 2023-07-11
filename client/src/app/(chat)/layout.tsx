'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { invoke } from '@tauri-apps/api/tauri';
import { isRegistered, register } from '@tauri-apps/api/globalShortcut';
import { useAtom } from 'jotai';

import { MenuButtons } from './menuButtons';
import { ChatList } from './chatList';
import { Settings } from './settings';
import { hasApiKeyAtom } from '../../atoms/apiKey';
import { Theme } from '../../types/style';
import type { Chat } from '../../types/chat';

const HOTKEY = 'Alt+Shift+Ctrl+A' as const;
const HOTKEY_RESIZE = 'Alt+Shift+Ctrl+S' as const;
const DEFAULT_THEME = Theme.Coffee as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [hasApiKey, setHasApiKey] = useAtom(hasApiKeyAtom);
  const [isInit, setIsInit] = useState(false);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const { chatId } = useParams();

  useEffect(() => {
    (async () => {
      try {
        const currentTheme = await invoke<Theme | null>('get_theme');
        if (currentTheme) {
          document.querySelector('html')?.setAttribute('data-theme', currentTheme.toLowerCase());
          setTheme(currentTheme);
        } else {
          await invoke('change_theme', { theme: DEFAULT_THEME });
        }

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
          } else {
            setHasApiKey(true);
          }
        } else {
          setHasApiKey(false);
        }

        setIsInit(true);
      } catch (error) {
        console.log(error);
        setIsInit(true);
      }
    })()
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setChats(await invoke<Chat[]>('get_chats'));
      } catch { }
    })();
  }, [chatId]);


  if (!isInit) return null;

  if (!hasApiKey) return (
    <div className="overflow-hidden h-full px-4 py-8">
      {children}
    </div>
  );

  return (
    <div className="px-4 py-8 h-full">
      {children}
      <div className="drawer fixed">
        <input id="chats" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <MenuButtons />
        </div>
        <div className="drawer-side">
          <label htmlFor="chats" className="drawer-overlay" />
          <ChatList chats={chats} />
        </div>
      </div>
      <div className="drawer fixed">
        <input id="settings" type="checkbox" className="drawer-toggle" />
        <div className="drawer-side">
          <label htmlFor="settings" className="drawer-overlay" />
          <Settings theme={theme} onChangeTheme={setTheme} />
        </div>
      </div>
    </div>
  );
};
