import { atom } from 'jotai';

import type { Notification } from '../types/notifications';

export const notificationsAtom = atom<Notification[]>([]);
