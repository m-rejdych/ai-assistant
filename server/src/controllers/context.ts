import { prisma } from '../util/prisma';
import { ContextTypeName } from '@prisma/client';

import { OPEN_AI_COMPLETIONS } from '../constants/openai';

export const addContextMessage = async (
  content: string,
  apiKey: string,
): Promise<void> => {
  const contextUserMessageType = await prisma.contextType.findUnique({
    where: { name: ContextTypeName.UserMessage },
  });
  if (!contextUserMessageType) {
    throw new Error('Context type not found.');
  }

  const contextSummaryType = await prisma.contextType.findUnique({
    where: { name: ContextTypeName.Summary },
  });
  if (!contextSummaryType) {
    throw new Error('Context type not found.');
  }

  const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });
  if (!key) {
    throw new Error('API key type not found.');
  }

  const contextMessage = await prisma.context.create({
    data: {
      typeId: contextUserMessageType.id,
      apiKeyId: key.id,
      content: content.trim(),
    },
  });
  const contextSummary = await prisma.context.findFirst({
    where: { typeId: contextSummaryType.id, apiKeyId: key.id },
    orderBy: { createdAt: 'desc' },
    select: { content: true },
  });

  const prompt = contextSummary
    ? `You will be given summary about some user labeled with {{summary}}. Please create a similar summary, but include information from user message, labeled {{message}}, to it.

{{summary}}
${contextSummary.content}

{{message}}
${contextMessage.content}
 `
    : `You will be given given a user message labeled {{message}}. Please create a summary about the user from the message you will be given.

{{message}}
${contextMessage.content}`;

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

  const completionResult = await response.json();

  await prisma.context.create({
    data: {
      typeId: contextSummaryType.id,
      apiKeyId: key.id,
      content: completionResult.choices[0].message.content,
    },
  });
};
