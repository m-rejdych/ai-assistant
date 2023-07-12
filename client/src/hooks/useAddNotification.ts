import { useSetAtom } from 'jotai';

import { notificationsAtom } from '../atoms/notificationsAtom';
import { type Notification, NotificationType } from '../types/notifications';

export const useAddNotification = () => {
  const setNotifications = useSetAtom(notificationsAtom);

  return ({ text, type }: Omit<Notification, 'id'>) => {
    setNotifications((prev) => [
      ...prev,
      { text, type: type ?? NotificationType.Info, id: Date.now() },
    ]);
  };
};
