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

// ============================================
// Reading Assignment System (New)
// ============================================

export type WordActionType = 'define' | 'illustrate' | 'fill';

export interface WordActionDefine {
  type: 'define';
  definition: string;
  randomizedWords?: string[]; // Words shuffled for student to rearrange
}

export interface WordActionIllustrate {
  type: 'illustrate';
  images: Array<{
    url: string;
    source: 'google' | 'phone_upload' | 'library';
    altText?: string;
  }>;
}

export interface WordActionFill {
  type: 'fill';
  lettersToHide: string[];
  hiddenLetterCount: number;
}

export type WordAction = WordActionDefine | WordActionIllustrate | WordActionFill;

export interface AssignmentWord {
  wordId: string; // Unique ID: "s0_w0", "s0_w1", etc
  wordText: string;
  wordPosition: number;
  action: WordAction;
}

export interface AssignmentSentence {
  sentenceId: string; // "s0", "s1", etc
  sentenceText: string;
  words: AssignmentWord[];
}

export interface ReadingAssignmentContent {
  originalParagraph: string;
  sentences: AssignmentSentence[];
}

export interface ZombieGift {
  name: string;
  description: string;
  icon?: string;
}

export interface ReadingAssignment {
  id: ID;
  tutorId: ID;
  classId: ID;
  title: string;
  description?: string;
  content: ReadingAssignmentContent;
  tools: string[];
  durationMinutes?: number;
  parentEncouragement?: string;
  zombieGifts?: ZombieGift[];
  dueDate?: Date;
  submissionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentImage {
  id: ID;
  assignmentId: ID;
  wordId: string;
  imageUrl: string;
  imageSource: 'google' | 'phone_upload' | 'library';
  altText?: string;
  createdAt: Date;
}

export interface StudentAnswer {
  actionType: WordActionType;
  studentAnswer: string | string[];
  timestamp: Date;
  isCorrect?: boolean;
}

export interface AssignmentSubmission {
  id: ID;
  assignmentId: ID;
  studentId: ID;
  answers: Record<string, StudentAnswer>;
  submissionStatus: 'PENDING' | 'SUBMITTED' | 'GRADED';
  score?: number;
  feedback?: string;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

