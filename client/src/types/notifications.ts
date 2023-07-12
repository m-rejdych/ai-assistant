export enum NotificationType {
  Info = 'alert-info',
  Success = 'alert-success',
  Warning = 'alert-warning',
  Error = 'alert-error',
}

export interface Notification {
  id: number;
  text: string;
  type?: NotificationType
}
