import { useEffect, useState, type FC } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { isRegistered, register } from '@tauri-apps/api/globalShortcut';
import { useAtom } from 'jotai';

import { ChatHistoryDrawer } from './layout/ChatHistoryDrawer';
import { SettingsDrawer } from './layout//SettingsDrawer';
import { Chat } from './layout/Chat';
import { Notifications } from './layout/Notifications';
import { hasApiKeyAtom } from './atoms/apiKey';
import { useAddNotification } from './hooks/useAddNotification';
import { NotificationType } from './types/notifications';
import { Theme } from './types/style';
import { Config } from './types/config';

const HOTKEY = 'Alt+Shift+Ctrl+A' as const;
const HOTKEY_RESIZE = 'Alt+Shift+Ctrl+S' as const;
const HOTKEY_GENERATE_SUMMARY = 'Alt+Shift+Ctrl+N' as const;
const DEFAULT_THEME = Theme.Coffee as const;

export const App: FC = () => {
  const [chatId, setChatId] = useState('');
  const [hasApiKey, setHasApiKey] = useAtom(hasApiKeyAtom);
  const [isInit, setIsInit] = useState(false);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const addNotification = useAddNotification();

  useEffect(() => {
    (async () => {
      try {
        const currentTheme = await invoke<Theme | null>('get_public_config', {
          config: Config.Theme,
        });
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
          await register(HOTKEY_RESIZE, async () => invoke('resize_window'));
        }
        if (!(await isRegistered(HOTKEY_GENERATE_SUMMARY))) {
          await register(HOTKEY_GENERATE_SUMMARY, async () => {
            addNotification({ text: 'Generating summary...' });
            await invoke('generate_summary');
            addNotification({ text: 'Summary created', type: NotificationType.Success });
          });
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
      } catch (error) {
        console.log(error);
      }

      setIsInit(true);
    })();
  }, []);

  useEffect(() => {
    if (!hasApiKey) return;

    (async () => {
      const activeChatId = await invoke<string>('get_active_chat');
      if (activeChatId) {
        setChatId(activeChatId);
      }
    })();
  }, [hasApiKey]);

  const handleChangeTheme = async (theme: Theme): Promise<void> => {
    setTheme(theme);

    try {
      setTheme(await invoke('get_public_config', { config: Config.Theme }));
    } catch (error) {
      console.log(error);
    }
  };

  if (!isInit) return null;

  return (
    <div className="px-4 py-8 h-screen">
      <Chat chatId={chatId} onNewChat={setChatId} />
      {hasApiKey && (
        <>
          <ChatHistoryDrawer chatId={chatId} onNewChat={setChatId} />
          <SettingsDrawer theme={theme} onChangeTheme={handleChangeTheme} />
          <Notifications />
        </>
      )}
    </div>
  );
};
