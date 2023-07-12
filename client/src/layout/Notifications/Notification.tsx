import { type FC, useEffect } from 'react';
import { useSetAtom } from 'jotai';

import { notificationsAtom } from '../../atoms/notificationsAtom';
import type { Notification as NotificationType } from '../../types/notifications';

interface Props {
  notification: NotificationType;
}

export const Notification: FC<Props> = ({ notification: { id, text, type } }) => {
  const setNotifications = useSetAtom(notificationsAtom);

  useEffect(() => {
    const expireTimeout = setTimeout(() => {
      setNotifications((prev) => prev.filter(({ id: notificationId }) => notificationId !== id));
    }, 3500);

    return () => {
      clearTimeout(expireTimeout);
    };
  }, []);

  return (
    <div className={`alert ${type ?? ''}`}>
      <span>{text}</span>
    </div>
  );
};
