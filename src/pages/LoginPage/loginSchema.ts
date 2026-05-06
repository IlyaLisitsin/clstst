import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'identifierRequired'),
  password: z.string().min(1, 'passwordRequired'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
