'use client';

import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { register, isRegistered } from '@tauri-apps/api/globalShortcut';

export default function Home() {
  useEffect(() => {
    (async () => {
      await invoke('resize_window');
      if (!(await isRegistered('Alt+Shift+Ctrl+Cmd+A'))) {
        await register('Alt+Shift+Ctrl+Cmd+A', () => invoke('toggle_window'));
      }

    })();
  }, []);

  return (
    <main className="h-full px-4 py-8 flex flex-col">
      <div className="flex-1" />
      <textarea className="textarea textarea-primary resize-none"></textarea>
    </main>
  );
}
