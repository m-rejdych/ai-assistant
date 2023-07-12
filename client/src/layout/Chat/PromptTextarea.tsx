import { forwardRef, useState, type HTMLProps } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

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

    const handleKeyDownPrompt = async (
      e: React.KeyboardEvent<HTMLTextAreaElement>,
    ): Promise<void> => {
      const currentPrompt = value.trim();

      if (e.key !== 'Enter' || e.shiftKey) return;
      if (!currentPrompt || pendingPrompt) return;
      e.preventDefault();

      setValue('');

      try {
        if (currentPrompt.startsWith('/')) {
          const [cmd, ...content] = currentPrompt.split(' ');

          switch (cmd) {
            case '/ctx': {
              if (!content.length) break;

              const contentStr = content.join(' ');
              onPendingPrompt(contentStr);

              await invoke('add_context_message', { content: contentStr });
              break;
            }
            default:
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
        console.log(error);
      } finally {
        onPendingPrompt('');
      }
    };

    return (
      <div className="border-t border-t-accent pt-4 mt-2 ml-1 mr-1 w-[calc(100%-0.5rem)]">
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
      </div>
    );
  },
);
