/**
 * Seed demo data for in-memory repositories (web platform).
 */

import { IAssignmentRepository } from '../data/repositories/IAssignmentRepository';
import { Assignment } from '../domain/entities/assignment';
import * as Crypto from 'expo-crypto';

export const seedInMemoryData = async (
  assignmentRepo: IAssignmentRepository
): Promise<void> => {
  console.log('Seeding in-memory demo data for web...');

  const classId = Crypto.randomUUID();

  const assignments: Omit<Assignment, 'id'>[] = [
    {
      title: 'Photosynthesis',
      description: 'Learn how plants convert sunlight into energy',
      classId,
      contentBlocks: [
        {
          id: Crypto.randomUUID(),
          type: 'DEFINITION',
          text: 'The process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water.',
        },
        {
          id: Crypto.randomUUID(),
          type: 'ILLUSTRATION_PICK',
          text: 'Which organelle performs photosynthesis?',
          data: {
            options: ['Chloroplast', 'Mitochondria', 'Nucleus', 'Ribosome'],
            correctIndex: 0,
          },
        },
        {
          id: Crypto.randomUUID(),
          type: 'PARAGRAPH_GATE',
          text: 'Plants use chlorophyll in their chloroplasts to capture light energy.',
        },
      ],
    },
    {
      title: 'The Water Cycle',
      description: 'Understand evaporation, condensation, and precipitation',
      classId,
      contentBlocks: [
        {
          id: Crypto.randomUUID(),
          type: 'PARAGRAPH_GATE',
          text: 'The water cycle describes the continuous movement of water on, above, and below the surface of the Earth.',
        },
        {
          id: Crypto.randomUUID(),
          type: 'FILL_IN_BLANK',
          text: 'Water turns into a gas through a process called ___.',
        },
      ],
    },
    {
      title: 'Cellular Respiration',
      description: 'How cells use glucose for energy',
      classId,
      contentBlocks: [
        {
          id: Crypto.randomUUID(),
          type: 'PARAGRAPH_GATE',
          text: 'Cellular respiration is the process by which cells break down glucose to release energy.',
        },
        {
          id: Crypto.randomUUID(),
          type: 'REARRANGE',
          text: 'Arrange the steps of aerobic respiration in order',
        },
      ],
    },
  ];

  // Create assignments in the repository
  for (const assignment of assignments) {
    try {
      const result = await assignmentRepo.createAssignment(assignment);
      if (!result.ok) {
        console.warn(`Failed to seed assignment: ${result.error}`);
      }
    } catch (e) {
      console.warn(`Error seeding assignment: ${e}`);
    }
  }

  console.log(`✓ Seeded ${assignments.length} demo assignments`);
};
