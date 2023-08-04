import { type FC, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

import { useAddNotification } from '../../hooks/useAddNotification';
import { ChatListItem } from './ChatListItem';
import { NotificationType } from '../../types/notifications';
import type { Chat } from '../../types/chat';

interface Props {
  chatId: string;
  onSelect: (chatId: string) => void;
}

export const ChatsList: FC<Props> = ({ chatId, onSelect }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const addNotification = useAddNotification();

  const loadChats = async (): Promise<void> => {
    try {
      setChats(await invoke<Chat[]>('get_chats'));
    } catch (error) {
      addNotification({ text: 'Something went wrong', type: NotificationType.Error });
      console.log(error);
    }
  };

  useEffect(() => {
    loadChats();
  }, [chatId]);

  const handleDelete = (id: string): void => {
    if (id === chatId) onSelect('');

    setChats((prev) => prev.filter(({ id: currentChatId }) => currentChatId !== id));
  };

  return (
    <ul className="menu p-4 w-80 h-full bg-base-200 text-base-content flex-nowrap overflow-y-auto">
      <li className="menu-title text-lg text-center">Chat history</li>
      {chats.map((chat) => (
        <li
          key={chat.id}
          className="w-full overflow-x-hidden rounded-lg relative"
          onClick={() => onSelect(chat.id)}
        >
          <ChatListItem chat={chat} currentChatId={chatId} onDelete={handleDelete} />
        </li>
      ))}
    </ul>
  );
};
