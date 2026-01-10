import { z } from 'zod';
import { Visibility } from '../types';

export const AssignmentSchema = z.object({
  id: z.string().optional(),
  classId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  contentBlocks: z.array(
    z.object({
      id: z.string().optional(),
      type: z.enum(['DEFINITION', 'ILLUSTRATION_PICK', 'FILL_IN_BLANK', 'REARRANGE', 'PARAGRAPH_GATE']),
      text: z.string().optional(),
      data: z.record(z.unknown()).optional(),
    })
  ),
  dueAt: z.string().optional(),
});

export const ScheduleSchema = z.object({
  id: z.string().optional(),
  studentUserId: z.string(),
  assignmentId: z.string(),
  startsAt: z.string(),
  endsAt: z.string().optional(),
  visibility: z.nativeEnum(Visibility),
});

export type AssignmentInput = z.infer<typeof AssignmentSchema>;
export type ScheduleInput = z.infer<typeof ScheduleSchema>;
