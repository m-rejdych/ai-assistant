import { type FC, useState } from 'react';
import { MdDelete } from 'react-icons/md';
import { invoke } from '@tauri-apps/api/tauri';

import type { Chat } from '../../types/chat';

interface Props {
  currentChatId: string;
  chat: Chat;
  onDelete: (id: string) => void;
}

export const ChatListItem: FC<Props> = ({ chat: { id, name }, currentChatId, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);

    try {
      await invoke('delete_chat_by_id', { chatId: id });
      onDelete(id);
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  return (
    <div
      className={`w-full min-h-[2.5rem] flex items-center${id === currentChatId ? ' active' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <p className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis">{name}</p>
      {isLoading && <span className="loading loading-ring loading-xs text-primary" />}
      {isHovered && (
        <button className="btn btn-square btn-xs" onClick={handleDelete}>
          <MdDelete className="text-lg text-error opacity-60" />
        </button>
      )}
    </div>
  );
};
