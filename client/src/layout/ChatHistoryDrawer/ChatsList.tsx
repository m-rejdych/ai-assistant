import { type FC, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

import type { Chat } from '../../types/chat';

interface Props {
  chatId: string;
  onSelect: (chatId: string) => void;
}

export const ChatList: FC<Props> = ({ chatId, onSelect }) => {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setChats(await invoke<Chat[]>('get_chats'));
      } catch {}
    })();
  }, [chatId]);

  return (
    <ul className="menu p-4 w-80 h-full bg-base-200 text-base-content">
      <li className="menu-title text-lg text-center">Chat history</li>
      {chats.map(({ id, name }) => (
        <li key={id} className="w-full overflow-x-hidden rounded-lg" onClick={() => onSelect(id)}>
          <p className={id === chatId ? 'active' : undefined}>{name}</p>
        </li>
      ))}
    </ul>
  );
};
