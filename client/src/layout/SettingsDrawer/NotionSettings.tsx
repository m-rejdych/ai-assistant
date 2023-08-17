import { type FC, useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

import { Editable } from '../../components/Editable';
import { Config } from '../../types/config';

enum KeyType {
  ApiKey,
  DbId,
}

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

  const handleSave =
    (type: KeyType) =>
      async (value: string): Promise<void> => {
        const trimmedValue = value.trim();
        if (!trimmedValue.length) return;

        try {
          switch (type) {
            case KeyType.ApiKey: {
              await invoke('save_notion_api_key', { notionApiKey: trimmedValue });
              setNotionApiKey(
                (await invoke<string | null>('get_public_config', {
                  config: Config.NotionApiKey,
                })) ?? '',
              );

              break;
            }
            case KeyType.DbId: {
              await invoke('save_notion_database_id', { databaseId: trimmedValue });
              setNotionDatabaseId(
                (await invoke<string | null>('get_public_config', {
                  config: Config.NotionDatabaseId,
                })) ?? '',
              );

              break;
            }
            default:
              break;
          }
        } catch (error) {
          console.log(error);
        }
      };

  return (
    <>
      <div className="flex w-full items-center justify-between mb-2">
        <p className="text-sm whitespace-nowrap mr-4">API key</p>
        <Editable
          showButton
          value={notionApiKey}
          onAccept={handleSave(KeyType.ApiKey)}
          inputProps={{ type: 'text', className: 'bg-base-200' }}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm whitespace-nowrap mr-4">DB ID</p>
        <Editable
          showButton
          value={notionDatabaseId}
          onAccept={handleSave(KeyType.DbId)}
          inputProps={{ type: 'text', className: 'bg-base-200' }}
        />
      </div>
    </>
  );
};
