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
  const prompt = `You will be given a message labeled about someone labeled {{message}}. Convert this message to contain the same information, but it must be in third person named "User" and start as if it was a bullet point. If the message contains more than one information, split this into separate points.
Here is an example:
INPUT: "He is smart, funny and he likes dogs"
OUTPUT: "- User is smart.\n- User is funny.\n- User likes dogs."

###

{{message}}
${trimmedContent}
`;

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
  const newPoint = completionResult.choices[0].message.content;
  const newContext = userContext ? `${userContext.content}\n${newPoint}` : newPoint;

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

  const prompt = `You will be given a message labeled about someone labeled {{message}}. Convert this message to contain the same information, but it must be in second person and start as if it was bullet point. If the message contains more than one information, split it into separate points
Here is an example:
INPUT: "He is smart, funny and you like dogs"
OUTPUT: "- You are smart.\n- You are funny.\n- You like dogs."

###

{{message}}
${trimmedContent}
`;

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
  const newPoint = completionResult.choices[0].message.content;
  const newContext = assistantContext ? `${assistantContext.content}\n${newPoint}` : newPoint;

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
