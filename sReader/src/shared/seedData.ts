/**
 * Seed data for demo purposes.
 * Populates SQLite with sample assignments and schedules on first run.
 */

import { Assignment } from '../domain/entities/assignment';
import { Schedule } from '../domain/entities/schedule';
import { Visibility } from './types';
import * as Crypto from 'expo-crypto';

function getSampleAssignments(): Omit<Assignment, 'id'>[] {
  return [
    {
      classId: 'demo-class-1',
      title: 'Understanding Photosynthesis',
      description: 'Learn how plants convert sunlight into energy. Interactive reading with comprehension checks.',
      contentBlocks: [
        {
          id: Crypto.randomUUID(),
          type: 'PARAGRAPH_GATE',
          text: 'Photosynthesis is the process by which plants, algae, and some bacteria convert light energy into chemical energy...',
        },
        {
          id: Crypto.randomUUID(),
          type: 'DEFINITION',
          text: 'Define the term "chlorophyll" and describe its role in photosynthesis.',
        },
        {
          id: Crypto.randomUUID(),
          type: 'ILLUSTRATION_PICK',
          text: 'Select the correct diagram showing the light and dark reactions.',
        },
        {
          id: Crypto.randomUUID(),
          type: 'FILL_IN_BLANK',
          text: 'The equation for photosynthesis is: ___ + water + light energy → glucose + oxygen',
        },
      ],
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      classId: 'demo-class-1',
      title: 'The Water Cycle Explained',
      description: 'Explore evaporation, condensation, precipitation, and collection in the hydrological cycle.',
      contentBlocks: [
        {
          id: Crypto.randomUUID(),
          type: 'PARAGRAPH_GATE',
          text: 'The water cycle is a continuous process by which water circulates through the Earth system...',
        },
        {
          id: Crypto.randomUUID(),
          type: 'DEFINITION',
          text: 'What is transpiration and how does it differ from evaporation?',
        },
        {
          id: Crypto.randomUUID(),
          type: 'REARRANGE',
          text: 'Arrange the stages of the water cycle in correct order: condensation, precipitation, evaporation, collection.',
        },
      ],
      dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      classId: 'demo-class-1',
      title: 'Cell Structure and Function',
      description: 'Deep dive into prokaryotic and eukaryotic cells, organelles, and their functions.',
      contentBlocks: [
        {
          id: Crypto.randomUUID(),
          type: 'PARAGRAPH_GATE',
          text: 'Cells are the fundamental units of life. They are the smallest units that can carry out all life processes...',
        },
        {
          id: Crypto.randomUUID(),
          type: 'ILLUSTRATION_PICK',
          text: 'Identify the mitochondria in the cell diagram. What is its role?',
        },
        {
          id: Crypto.randomUUID(),
          type: 'FILL_IN_BLANK',
          text: 'The ___ controls all activities in the cell and contains the cell\'s genetic material.',
        },
      ],
      dueAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export async function seedDemoData(repo: any): Promise<void> {
  try {
    // Check if data already seeded
    const existingCount = (await repo.listAssignments('demo-class-1', 1, 1)).value?.total || 0;
    if (existingCount > 0) {
      console.log('Demo data already seeded.');
      return;
    }

    // Get sample assignments (generates UUIDs at runtime)
    const sampleAssignments = getSampleAssignments();

    // Insert sample assignments
    for (const assignment of sampleAssignments) {
      await repo.createAssignment(assignment);
    }

    console.log('✓ Demo data seeded successfully');
  } catch (e) {
    console.error('Failed to seed demo data:', e);
  }
}
