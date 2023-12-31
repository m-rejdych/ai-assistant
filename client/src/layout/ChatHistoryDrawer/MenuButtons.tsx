import { useState, type FC } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { MdHistory, MdAdd, MdSettings, MdRestartAlt, MdExitToApp } from 'react-icons/md';

interface Props {
  onNewChat: () => void;
}

export const MenuButtons: FC<Props> = ({ onNewChat }) => {
  const [isMenuHovered, setIsMenuHovered] = useState(false);

  const handleRestart = async (): Promise<void> => {
    await invoke('restart');
  };

  const handleExit = async (): Promise<void> => {
    await invoke('exit');
  };

  return (
    <div className="fixed top-2 -left-9 bg-base-200 rounded-box opacity-50 hover:opacity-100 transition-transform hover:translate-x-7">
      <ul
        className="menu menu-xs"
        onMouseEnter={() => setIsMenuHovered(true)}
        onMouseLeave={() => setIsMenuHovered(false)}
      >
        <li>
          <label
            className="cursor-pointer tooltip tooltip-right"
            onClick={onNewChat}
            data-tip="New chat"
          >
            <MdAdd className="text-xl" />
          </label>
        </li>
        <li>
          <label
            htmlFor="chats"
            className="cursor-pointer tooltip tooltip-right"
            data-tip="Chat history"
          >
            <MdHistory className="text-xl" />
          </label>
        </li>
        <li>
          <label
            className="cursor-pointer tooltip tooltip-right"
            htmlFor="settings"
            data-tip="Settings"
          >
            <MdSettings className="text-xl" />
          </label>
        </li>
        <li>
          <label
            className="cursor-pointer tooltip tooltip-right"
            data-tip="Restart"
            onClick={handleRestart}
          >
            <MdRestartAlt className="text-xl" />
          </label>
        </li>
        <li>
          <label
            className="cursor-pointer tooltip tooltip-right"
            data-tip="Exit"
            onClick={handleExit}
          >
            <MdExitToApp className="text-xl" />
          </label>
        </li>
      </ul>
      {!isMenuHovered && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          <div className="rounded-full bg-primary w-2 h-2 mb-1" />
          <div className="rounded-full bg-primary w-2 h-2" />
          <div className="rounded-full bg-primary w-2 h-2 mt-1" />
        </div>
      )}
    </div>
  );
};
