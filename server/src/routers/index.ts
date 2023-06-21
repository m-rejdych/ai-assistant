import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import type { Context } from '../utils/trpc/context';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  hello: t.procedure
    .input(z.string())
    .query(({ input }) => {
      return `Hello ${input}`;
    }),
});

export type AppRouter = typeof appRouter;
