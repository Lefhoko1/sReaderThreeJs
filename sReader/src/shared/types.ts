export type ID = string;
export type Timestamp = string; // ISO string

export enum Visibility {
  PRIVATE = 'PRIVATE',
  FRIENDS = 'FRIENDS',
  CLASS = 'CLASS',
}

export enum Role {
  STUDENT = 'STUDENT',
  GUARDIAN = 'GUARDIAN',
  TUTOR = 'TUTOR',
  ACADEMY_ADMIN = 'ACADEMY_ADMIN',
  SYS_ADMIN = 'SYS_ADMIN',
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
