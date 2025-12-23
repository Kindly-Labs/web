import { atom } from 'nanostores';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

export const notifications = atom<Notification[]>([]);

export function addNotification(type: NotificationType, message: string, duration = 5000) {
  const id = Math.random().toString(36).substring(2, 9);
  const notification: Notification = { id, type, message, duration };

  notifications.set([...notifications.get(), notification]);

  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }

  return id;
}

export function removeNotification(id: string) {
  notifications.set(notifications.get().filter((n) => n.id !== id));
}
