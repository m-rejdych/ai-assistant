export enum RoleType {
  System = 'System',
  Assistant = 'Assistant',
  User = 'User',
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  role: {
    type: RoleType;
  };
}

export interface Chat {
  id: string;
  name: string;
}

export interface SendMessageData {
  userMessage: Message;
  assistantMessage: Message;
  chat: Chat;
}
