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

export interface SendMessageData {
  userMessage: Message;
  assistantMessage: Message;
}
