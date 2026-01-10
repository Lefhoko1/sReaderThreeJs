import { ID } from '../../shared/types';

export interface Academy {
  id: ID;
  ownerUserId: ID;
  name: string;
  description?: string;
}

export interface Class {
  id: ID;
  academyId: ID;
  name: string;
  term?: string;
  subject?: string;
}

export interface Enrollment {
  id: ID;
  classId: ID;
  studentUserId: ID;
  role?: 'STUDENT' | 'ASSISTANT' | 'TUTOR';
}
