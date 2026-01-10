import { ID, Timestamp } from '../../shared/types';

export type ContentBlockType =
  | 'DEFINITION'
  | 'ILLUSTRATION_PICK'
  | 'FILL_IN_BLANK'
  | 'REARRANGE'
  | 'PARAGRAPH_GATE';

export interface ContentBlock {
  id: ID;
  type: ContentBlockType;
  text?: string;
  data?: Record<string, unknown>;
}

export interface Assignment {
  id: ID;
  classId: ID;
  title: string;
  description?: string;
  contentBlocks: ContentBlock[];
  dueAt?: Timestamp;
}

export interface AssignmentTool {
  id: ID;
  assignmentId: ID;
  type: string;
  uri?: string;
  metadata?: Record<string, unknown>;
}

export interface ContentAsset {
  id: ID;
  type: 'ILLUSTRATION' | 'AUDIO' | 'PDF';
  uri: string;
  checksum?: string;
  ownerUserId?: ID;
}
