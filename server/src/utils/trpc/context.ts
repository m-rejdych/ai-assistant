import type { inferAsyncReturnType } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

export const createContext = ({}: CreateExpressContextOptions) => ({});

export type Context = inferAsyncReturnType<typeof createContext>;
