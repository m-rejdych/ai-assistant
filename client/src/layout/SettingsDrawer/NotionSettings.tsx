import { type FC, useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

import { Config } from '../../types/config';

export const NotionSettings: FC = () => {
  const [notionApiKey, setNotionApiKey] = useState('');
  const [notionDatabaseId, setNotionDatabaseId] = useState('');
  const notionApiKeyRef = useRef<HTMLInputElement>(null);
  const notionDatabaseIdRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const currentKey = await invoke<string | null>('get_public_config', {
        config: Config.NotionApiKey,
      });
      const currentDatabaseId = await invoke<string | null>('get_public_config', {
        config: Config.NotionDatabaseId,
      });

      if (currentKey) setNotionApiKey(currentKey);
      if (currentDatabaseId) setNotionDatabaseId(currentDatabaseId);
    })();
  }, []);

  const handleSaveNotionApiKey = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (e.key !== 'Enter') return;

    const trimmedKey = notionApiKey.trim();
    if (!trimmedKey.length) return;

    try {
      await invoke('save_notion_api_key', { notionApiKey: trimmedKey });
      setNotionApiKey(
        (await invoke<string | null>('get_public_config', {
          config: Config.NotionApiKey,
        })) ?? '',
      );
    } catch (error) {
      console.log(error);
    }

    notionApiKeyRef.current?.blur();
  };

  const handleSaveNotionDatabaseId = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (e.key !== 'Enter') return;

    const trimmedDatabaseId = notionDatabaseId.trim();
    if (!trimmedDatabaseId.length) return;

    try {
      await invoke('save_notion_database_id', { databaseId: trimmedDatabaseId });
      setNotionDatabaseId(
        (await invoke<string | null>('get_public_config', {
          config: Config.NotionDatabaseId,
        })) ?? '',
      );
    } catch (error) {
      console.log(error);
    }

    notionDatabaseIdRef.current?.blur();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm whitespace-nowrap">API key</p>
        <input
          type="text"
          className="input input-bordered bg-base-200 input-primary input-sm max-w-xs"
          value={notionApiKey}
          onChange={(e) => setNotionApiKey(e.target.value)}
          onKeyDown={handleSaveNotionApiKey}
          ref={notionApiKeyRef}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm whitespace-nowrap">DB ID</p>
        <input
          type="text"
          className="input input-bordered bg-base-200 input-primary input-sm max-w-xs"
          value={notionDatabaseId}
          onChange={(e) => setNotionDatabaseId(e.target.value)}
          onKeyDown={handleSaveNotionDatabaseId}
          ref={notionDatabaseIdRef}
        />
      </div>
    </>
  );
};
