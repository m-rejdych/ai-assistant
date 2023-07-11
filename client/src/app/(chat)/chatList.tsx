import type { FC } from 'react';
import { useParams, useRouter } from 'next/navigation';

import type { Chat } from '../../types/chat';

interface Props {
  chats: Chat[];
}

export const ChatList: FC<Props> = ({ chats }) => {
  const { chatId } = useParams();
  const router = useRouter();

  return (
    <ul className="menu p-4 w-80 h-full bg-base-200 text-base-content">
      <li className="menu-title text-lg text-center">Chat history</li>
      {chats.map(({ id, name }) => (
        <li key={id} className="w-full overflow-x-hidden rounded-lg" onClick={() => router.push(`/${id}`)}>
          <p className={id === chatId ? 'active' : undefined}>{name}</p>
        </li>
      ))}
    </ul>
  );
};
