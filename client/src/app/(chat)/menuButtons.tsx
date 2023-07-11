import type { FC } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useRouter } from 'next/navigation';
import { MdHistory, MdAdd, MdSettings, MdRestartAlt, MdExitToApp } from 'react-icons/md';

export const MenuButtons: FC = () => {
  const router = useRouter();

  const handleRestart = async (): Promise<void> => {
    await invoke('restart');
  };

  const handleExit = async (): Promise<void> => {
    await invoke('exit');
  };

  return (
    <ul className="menu menu-xs fixed top-2 left-2 bg-base-200 rounded-box">
      <li>
        <label className="cursor-pointer tooltip tooltip-right" onClick={() => router.push('/?skipActiveChatCheck=true')} data-tip="New chat">
          <MdAdd className="text-xl" />
        </label>
      </li>
      <li>
        <label htmlFor="chats" className="cursor-pointer tooltip tooltip-right" data-tip="Chat history">
          <MdHistory className="text-xl" />
        </label>
      </li>
      <li>
        <label className="cursor-pointer tooltip tooltip-right" htmlFor="settings" data-tip="Settings">
          <MdSettings className="text-xl" />
        </label>
      </li>
      <li>
        <label className="cursor-pointer tooltip tooltip-right" data-tip="Restart" onClick={handleRestart}>
          <MdRestartAlt className="text-xl" />
        </label>
      </li>
      <li>
        <label className="cursor-pointer tooltip tooltip-right" data-tip="Exit" onClick={handleExit}>
          <MdExitToApp className="text-xl" />
        </label>
      </li>
    </ul>
  );
};
