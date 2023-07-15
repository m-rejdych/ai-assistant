import { prisma } from '../util/prisma';
import { RoleType, type Prisma } from '@prisma/client';

import fetch from 'node-fetch';
import { OPEN_AI_COMPLETIONS } from '../constants/openai';
import type { CompletionResult } from '../types/openai';

type Message = Prisma.MessageGetPayload<{
  select: {
    role: { select: { type: true } };
    id: true;
    content: true;
    createdAt: true;
  };
}>;

type Chat = Prisma.ChatGetPayload<{ select: { id: true; name: true } }>;

interface SendMessageData {
  userMessage: Message;
  assistantMessage: Message;
  chat: Chat;
}

export const sendMessage = async (
  content: string,
  apiKey: string,
  chatId?: string,
): Promise<SendMessageData> => {
  const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });
  if (!key) throw new Error('Api key not found.');

  const userRole = await prisma.role.findUnique({
    where: { type: RoleType.User },
  });
  if (!userRole) throw new Error('User role not found.');

  const assistantRole = await prisma.role.findUnique({
    where: { type: RoleType.Assistant },
  });
  if (!assistantRole) throw new Error('Assistant role not found.');

  const userContext = await prisma.userContext.findUnique({
    where: { apiKeyId: key.id },
    select: { content: true },
  });
  const assistantContext = await prisma.assistantContext.findUnique({
    where: { apiKeyId: key.id },
    select: { content: true },
  });

  const todayMessage = `{{GENERAL INFORMATION}}
- Today is ${new Date().toLocaleString('pl-PL', {
    timeZone: 'Europe/Warsaw',
  })}`;

  const userContextMessage = userContext
    ? `

###

{{INFORMATION ABOUT USER}}
${userContext.content}`
    : '';
  const assistantContextMessage = `

###

{{INFORMATION ABOUT YOU}}
- You are user's personal assistant
- You must not mention that you are an AI model in your messages${
    assistantContext?.content ? `\n${assistantContext.content}` : ''
  }`;

  let chat =
    chatId &&
    (await prisma.chat.findUnique({
      where: { id: chatId },
      select: { id: true, apiKeyId: true, name: true },
    }));
  if (chatId && !chat) throw new Error('Chat not found');

  if (chat && chat.apiKeyId !== key.id)
    throw new Error('This chat is not connected to your api key.');

  const contextMessages = chat
    ? (
        await prisma.message.findMany({
          where: { chatId: chat.id },
          orderBy: { createdAt: 'asc' },
          select: { content: true, role: { select: { type: true } } },
        })
      ).map(({ content, role: { type } }) => ({
        content,
        role: type.toLowerCase(),
      }))
    : [];

  const trimmedContent = content.trim();
  const newUserMessage = { role: 'user', content: trimmedContent };

  const systemMessage = {
    role: 'system',
    content: `${todayMessage}${assistantContextMessage}${userContextMessage}`,
  };

  const messages = [systemMessage, ...contextMessages, newUserMessage];

  const completionResponse = await fetch(OPEN_AI_COMPLETIONS, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      messages,
    }),
  });

  const completionResult = (await completionResponse.json()) as CompletionResult;
  const newAssistantMessage = {
    role: 'assistant',
    content: completionResult.choices[0].message.content,
  };

  if (!chat) {
    const chatNameMessage = {
      role: 'user',
      content:
        'Based on 2 previous messages, generate short title describing what the conversation is about. Respond with the title without any punctuation and nothing more. Maximum word count for the title is 5.',
    };

    const chatNameCompletionResponse = await fetch(OPEN_AI_COMPLETIONS, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        messages: [newUserMessage, newAssistantMessage, chatNameMessage],
      }),
    });

    const chatNameCompletionResult = (await chatNameCompletionResponse.json()) as CompletionResult;
    const chatName = chatNameCompletionResult.choices[0].message.content;

    chat = await prisma.chat.create({
      data: { apiKeyId: key.id, name: chatName },
      select: { id: true, apiKeyId: true, name: true },
    });
  }

  const userMessage = await prisma.message.create({
    data: {
      chatId: chat.id,
      roleId: userRole.id,
      content: content.trim(),
    },
    select: {
      role: { select: { type: true } },
      id: true,
      content: true,
      createdAt: true,
    },
  });

  const assistantMessage = await prisma.message.create({
    data: {
      chatId: chat.id,
      roleId: assistantRole.id,
      content: completionResult.choices[0].message.content,
    },
    select: {
      role: { select: { type: true } },
      id: true,
      content: true,
      createdAt: true,
    },
  });
  await prisma.chat.update({ where: { id: chat.id }, data: { updatedAt: new Date() } });

  const { id, name } = chat;

  return {
    userMessage,
    assistantMessage,
    chat: { id, name },
  };
};

export const getMessagesByChatId = async (chatId: string, apiKey: string): Promise<Message[]> => {
  const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });
  if (!key) throw new Error('Api key not found.');

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { id: true, apiKeyId: true },
  });
  if (!chat) throw new Error('Chat not found.');
  if (chat.apiKeyId !== key.id) throw new Error('This chat is not connected to your api key.');

  const messages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      content: true,
      createdAt: true,
      role: { select: { type: true } },
    },
  });

  return messages;
};

export const getActiveChatId = async (apiKey: string): Promise<string> => {
  const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });
  if (!key) throw new Error('Api key not found.');

  const lastUpdatedDate = new Date(Date.now() - 10 * 60_000);
  const activeChat = await prisma.chat.findFirst({
    where: { apiKeyId: key.id, updatedAt: { gte: lastUpdatedDate } },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });

  return activeChat?.id ?? '';
};

export const getChats = async (apiKey: string): Promise<Chat[]> => {
  const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });
  if (!key) throw new Error('API key not found.');

  const chats = await prisma.chat.findMany({
    where: { apiKeyId: key.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
  });

  return chats;
};

export const deleteChatById = async (chatId: string, apiKey: string): Promise<void> => {
  const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });
  if (!key) throw new Error('API key not found.');

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { id: true, apiKeyId: true },
  });
  if (!chat) throw new Error('Chat not found.');
  if (chat.apiKeyId !== key.id) throw new Error('This chat is not connected to your API key.');

  await prisma.chat.delete({ where: { id: chat.id } });
};
