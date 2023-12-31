import { forwardRef, useState, type HTMLProps } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

import { useAddNotification } from '../../hooks/useAddNotification';
import { NotificationType } from '../../types/notifications';
import type { SendMessageData } from '../../types/chat';

interface Props extends HTMLProps<HTMLTextAreaElement> {
  chatId: string;
  pendingPrompt: string;
  onSend: (data: SendMessageData) => void;
  onPendingPrompt: (prompt: string) => void;
}

export const PromptTextarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ chatId, pendingPrompt, onSend, onPendingPrompt, className, ...rest }, ref) => {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const addNotification = useAddNotification();

    const handleKeyDownPrompt = async (
      e: React.KeyboardEvent<HTMLTextAreaElement>,
    ): Promise<void> => {
      const currentPrompt = value.trim();

      if (e.key !== 'Enter' || e.shiftKey) return;
      if (!currentPrompt || pendingPrompt || loading) return;
      e.preventDefault();

      setValue('');

      try {
        if (currentPrompt.startsWith('/')) {
          setLoading(true);
          const [cmd, ...content] = currentPrompt.split(' ');

          switch (cmd) {
            case '/ctx-u': {
              if (!content.length) break;

              const contentStr = content.join(' ').trim();

              await invoke('add_user_context_message', { content: contentStr });
              addNotification({ text: 'Context expanded', type: NotificationType.Success });
              break;
            }
            case '/ctx-a': {
              if (!content.length) break;

              const contentStr = content.join(' ').trim();

              await invoke('add_assistant_context_message', { content: contentStr });
              addNotification({ text: 'Context expanded', type: NotificationType.Success });
              break;
            }
            case '/clear': {
              const filteredContent = content.filter(Boolean);
              if (filteredContent.length !== 1) break;

              const [contextType] = filteredContent;
              switch (contextType) {
                case 'ctx-u': {
                  await invoke('delete_user_context');
                  addNotification({ text: 'Context removed', type: NotificationType.Warning });
                  break;
                }
                case 'ctx-a': {
                  await invoke('delete_assistant_context');
                  addNotification({ text: 'Context removed', type: NotificationType.Warning });
                  break;
                }
                default:
                  addNotification({ text: 'Invalid command', type: NotificationType.Error });
                  break;
              }
              break;
            }
            case '/summarize': {
              const filteredContent = content.filter(Boolean);
              if (filteredContent.length !== 1) break;

              const [url] = filteredContent;
              const httpsRegexp =
                /https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
              if (!httpsRegexp.test(url)) {
                addNotification({ text: 'Invalid URL', type: NotificationType.Error });
                break;
              }

              addNotification({ text: 'Generating summary...' });
              await invoke('generate_summary');
              addNotification({ text: 'Summary created', type: NotificationType.Success });
              break;
            }
            default:
              addNotification({ text: 'Invalid command', type: NotificationType.Error });
              break;
          }
        } else {
          onPendingPrompt(currentPrompt);

          const data = await invoke<SendMessageData>('send_message', {
            content: currentPrompt,
            chatId,
          });

          onSend(data);
        }
      } catch (error) {
        addNotification({ text: 'Something went wrong', type: NotificationType.Error });
        console.log(error);
      }

      setLoading(false);
      onPendingPrompt('');
    };

    return (
      <div className="border-t border-t-accent pt-4 mt-2 ml-1 mr-1 w-[calc(100%-0.5rem)] relative">
        <textarea
          ref={ref}
          autoFocus
          placeholder="Enter prompt"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDownPrompt}
          {...rest}
          className={`textarea textarea-primary resize-none w-full${
            className ? ` ${className}` : ''
          }`}
        />
        {loading && (
          <span className="loading loading-ring loading-lg text-primary absolute right-4 top-1/2 -translate-y-[calc(50%-0.25rem)]" />
        )}
      </div>
    );
  },
);
