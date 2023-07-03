import { prisma } from '../util/prisma';

import { OPEN_AI_COMPLETIONS } from '../constants/openai';

export const addContextMessage = async (
  content: string,
  apiKey: string,
): Promise<void> => {
  const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });
  if (!key) {
    throw new Error('API key type not found.');
  }

  const trimmedContent = content.trim();
  if (!trimmedContent) return;

  const userContext = await prisma.context.findUnique({
    where: { apiKeyId: key.id },
    select: { id: true, content: true },
  });

  const prompt = userContext
    ? `You will be given summary about some user labeled with {{summary}}. Please create a similar summary - include all of the information from previous summary and extend it with information from user message labeled {{message}}. Always answer with sort bullet points about the user and nothing more.

{{summary}}
${userContext.content}

###

{{message}}
${trimmedContent}`
    : `You will be given given a user message labeled {{message}}. Please create a summary about the user from the message you will be given. Always answer with short bullet about the user and nothing more.

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

  const completionResult = await response.json();
  const newContext = completionResult.choices[0].message.content;

  if (userContext) {
    await prisma.context.update({
      where: { id: userContext.id },
      data: { content: newContext },
    });
  } else {
    await prisma.context.create({
      data: { apiKeyId: key.id, content: newContext },
    });
  }
};
