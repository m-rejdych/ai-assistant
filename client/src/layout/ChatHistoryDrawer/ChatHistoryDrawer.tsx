import type { FC } from 'react';

import { MenuButtons } from './MenuButtons';
import { ChatList } from './ChatsList';

interface Props {
  chatId: string;
  onNewChat: (id: string) => void;
}

export const ChatHistoryDrawer: FC<Props> = ({ chatId, onNewChat }) => (
  <div className="drawer fixed">
    <input id="chats" type="checkbox" className="drawer-toggle" />
    <div className="drawer-content">
      <MenuButtons onNewChat={() => onNewChat('')} />
    </div>
    <div className="drawer-side">
      <label htmlFor="chats" className="drawer-overlay" />
      <ChatList chatId={chatId} onSelect={onNewChat} />
    </div>
  </div>
);
