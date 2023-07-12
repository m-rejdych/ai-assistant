import type { FC } from 'react';
import { useAtomValue } from 'jotai';

import { Notification } from './Notification';
import { notificationsAtom } from '../../atoms/notificationsAtom';

export const Notifications: FC = () => {
  const notifications = useAtomValue(notificationsAtom);

  return (
    <div className="toast toast-top toast-end">
      {notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} />
      ))}
    </div>
  );
};
