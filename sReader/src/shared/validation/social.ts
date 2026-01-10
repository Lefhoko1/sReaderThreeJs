import { z } from 'zod';

export const FriendshipSchema = z.object({
  id: z.string().optional(),
  requesterUserId: z.string(),
  addresseeUserId: z.string(),
  status: z.enum(['PENDING', 'ACCEPTED', 'BLOCKED']),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type FriendshipInput = z.infer<typeof FriendshipSchema>;
