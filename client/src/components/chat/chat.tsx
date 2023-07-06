import { useRef, useEffect, type FC, type HTMLProps } from 'react';

import { type Message, RoleType } from '../../types/chat';

interface Props extends HTMLProps<HTMLDivElement> {
  messages: Message[];
  pendingPrompt: string;
}

export const Chat: FC<Props> = ({ messages, pendingPrompt, ...rest }) => {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatRef.current) return;

    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages.length, pendingPrompt]);

  const isUser = (roleType: RoleType): boolean => roleType === RoleType.User;

  const getTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const hour = date.getHours();
    const minutes = date.getMinutes();

    return `${hour > 10 ? hour : `0${hour}`}:${minutes > 10 ? minutes : `0${minutes}`}`;
  };

  return (
    <div ref={chatRef} {...rest}>
      {messages.map(({ id, content, createdAt, role: { type } }) => (
        <div key={id} className={`chat ${isUser(type) ? 'chat-end' : 'chat-start'}`}>
          <div className="chat-image avatar">
            <div className="w-10 rounded-full">
              <div className="avatar placeholder">
                <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                  <span className="text-xs">{isUser(type) ? 'U' : 'A'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="chat-header">
            {isUser(type) ? (
              <>
                <time className="text-xs  opacity-50 mr-1">{getTime(createdAt)}</time>
                User
              </>
            ) : (
              <>
                Assistant
                <time className="text-xs  opacity-50 ml-1">{getTime(createdAt)}</time>
              </>
            )}
          </div>
          <div className={`chat-bubble${isUser(type) ? ' chat-bubble-primary' : ''}`}>
            {content.split('\n').map((chunk, index) => (
              <p className="min-h-6" key={`${id}-${index}`}>
                {chunk}
              </p>
            ))}
          </div>
        </div>
      ))}
      {!!pendingPrompt && (
        <>
          <div className="chat chat-end">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <div className="avatar placeholder">
                  <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                    <span className="text-xs">U</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="chat-header">User</div>
            <div className="chat-bubble chat-bubble-primary">{pendingPrompt}</div>
          </div>
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <div className="avatar placeholder">
                  <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                    <span className="text-xs">A</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="chat-bubble flex items-end">
              <span className="loading loading-dots text-secondary loading-md"></span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
