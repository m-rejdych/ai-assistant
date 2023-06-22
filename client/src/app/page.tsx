'use client';

import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { register, isRegistered } from '@tauri-apps/api/globalShortcut';

export default function Home() {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const focusInput = (): void => {
      if (!inputRef.current) return;

      inputRef.current.focus();
    };

    window.addEventListener('focus', focusInput);

    (async () => {
      await invoke('resize_window');
      if (!(await isRegistered('Alt+Shift+Ctrl+Cmd+A'))) {
        await register('Alt+Shift+Ctrl+Cmd+A', () => invoke('toggle_window'));
      }
    })();

    return () => {
      window.removeEventListener('focus', focusInput);
    };
  }, []);

  return (
    <main className="h-full px-4 py-8 flex flex-col">
      <div className="flex-1" />
      <textarea
        className="textarea textarea-primary resize-none"
        ref={inputRef}
      ></textarea>
    </main>
  );
}
