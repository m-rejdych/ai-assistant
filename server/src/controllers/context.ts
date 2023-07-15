import { prisma } from '../util/prisma';

import fetch from 'node-fetch';
import { OPEN_AI_COMPLETIONS } from '../constants/openai';
import type { CompletionResult } from '../types/openai';

export const addUserContextMessage = async (content: string, apiKey: string): Promise<void> => {
  const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });
  if (!key) {
    throw new Error('API key type not found.');
  }

  const trimmedContent = content.trim();
  if (!trimmedContent) return;

  const userContext = await prisma.userContext.findUnique({
    where: { apiKeyId: key.id },
    select: { id: true, content: true },
  });

  const prompt = userContext
    ? `You will be given summary about some user labeled {{summary}}. Please create a similar summary - include all of the information from previous summary and extend it with information from user message labeled {{message}}. Always answer with sort bullet points about the user and nothing more. The points must start with "- User"

{{summary}}
${userContext.content}

###

{{message}}
${trimmedContent}`
    : `You will be given given a user message labeled {{message}}. Please create a summary about the user from the message you will be given. Always answer with short bullet about the user and nothing more. The points must start with "- User"

{{message}}
${trimmedContent}`;

  const response = await fetch(OPEN_AI_COMPLETIONS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const completionResult = (await response.json()) as CompletionResult;
  const newContext = completionResult.choices[0].message.content;

  if (userContext) {
    await prisma.userContext.update({
      where: { id: userContext.id },
      data: { content: newContext },
    });
  } else {
    await prisma.userContext.create({
      data: { apiKeyId: key.id, content: newContext },
    });
  }
};

export const addAssistantContextMessage = async (
  content: string,
  apiKey: string,
): Promise<void> => {
  const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });
  if (!key) {
    throw new Error('API key type not found.');
  }

  const trimmedContent = content.trim();
  if (!trimmedContent) return;

  const assistantContext = await prisma.assistantContext.findUnique({
    where: { apiKeyId: key.id },
    select: { id: true, content: true },
  });

  const prompt = assistantContext
    ? `You will be given summary about assistant labeled {{summary}}. Please create a similar summary - include all of the information from previous summary and extend it with definition about assistant labeled {{definition}}. Always answer with short bullet points about the assistant and nothing more. The points must be in second person and start with "- You"

{{summary}}
${assistantContext.content}

###

{{definition}}
${trimmedContent}`
    : `You will be given given definition about assistant labeled {{definition}}. Please create a summary about the assistant based on definition you will be given. Always answer with short bullet points about the assistant and nothing more. The points must be in second person and start with "- You"


{{definition}}
${trimmedContent}`;

  const response = await fetch(OPEN_AI_COMPLETIONS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const completionResult = (await response.json()) as CompletionResult;
  const newContext = completionResult.choices[0].message.content;

  if (assistantContext) {
    await prisma.assistantContext.update({
      where: { id: assistantContext.id },
      data: { content: newContext },
    });
  } else {
    await prisma.assistantContext.create({
      data: { apiKeyId: key.id, content: newContext },
    });
  }
};

export const deleteUserContext = async (apiKey: string): Promise<void> => {
  const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });
  if (!key) throw new Error('API key not found.');

  const userContext = await prisma.userContext.findUnique({ where: { apiKeyId: key.id } });
  if (!userContext) return;

  await prisma.userContext.delete({ where: { id: userContext.id } });
};

export const deleteAssistantContext = async (apiKey: string): Promise<void> => {
  const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });
  if (!key) throw new Error('API key not found.');

  const assistantContext = await prisma.assistantContext.findUnique({
    where: { apiKeyId: key.id },
  });
  if (!assistantContext) return;

  await prisma.assistantContext.delete({ where: { id: assistantContext.id } });
};
