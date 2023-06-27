import { prisma } from '../util/prisma';
import { RoleType, type Prisma } from '@prisma/client';

const OPEN_AI_COMPLETIONS =
  'https://api.openai.com/v1/chat/completions' as const;

type Message = Prisma.MessageGetPayload<{
  select: { role: { select: { type: true } }; id: true; content: true };
}>;

interface SendMessageData {
  userMessage: Message;
  assistantMessage: Message;
}

export const sendMessage = async (
  content: string,
  apiKey: string,
): Promise<SendMessageData> => {
  const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });

  if (!key) {
    throw new Error('Api key not found.');
  }

  const userRole = await prisma.role.findUnique({
    where: { type: RoleType.User },
  });

  if (!userRole) {
    throw new Error('User role not found.');
  }

  const assistantRole = await prisma.role.findUnique({
    where: { type: RoleType.Assistant },
  });

  if (!assistantRole) {
    throw new Error('Assistant role not found.');
  }

  const userMessage = await prisma.message.create({
    data: { roleId: userRole.id, apiKeyId: key.id, content },
    select: { role: { select: { type: true } }, id: true, content: true },
  });

  const contextDate = new Date(Date.now() - 10 * 60_000);

  const contextMessages = (
    await prisma.message.findMany({
      where: { createdAt: { gte: contextDate } },
      orderBy: { createdAt: 'asc' },
      select: { content: true, role: { select: { type: true } } },
    })
  ).map(({ content, role: { type } }) => ({
    content,
    role: type.toLowerCase(),
  }));

  const response = await fetch(OPEN_AI_COMPLETIONS, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: contextMessages,
      temperature: 0.7,
    }),
  });

  const completionResult = await response.json();

  const assistantMessage = await prisma.message.create({
    data: {
      roleId: assistantRole.id,
      apiKeyId: key.id,
      content: completionResult.choices[0].message.content,
    },
    select: { role: { select: { type: true } }, id: true, content: true },
  });

  return {
    userMessage,
    assistantMessage,
  };
};
