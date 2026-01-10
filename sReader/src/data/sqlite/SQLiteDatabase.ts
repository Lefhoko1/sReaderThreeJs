/**
 * SQLiteDatabase - Wrapper around expo-sqlite.
 * Handles schema initialization and raw queries.
 */

import * as SQLite from 'expo-sqlite';

export class SQLiteDatabase {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('sreader.db');
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        roles TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        displayName TEXT NOT NULL,
        avatarUrl TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS profiles (
        userId TEXT PRIMARY KEY,
        bio TEXT,
        locationConsent INTEGER NOT NULL DEFAULT 0,
        notificationPrefs TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        contentBlocks TEXT NOT NULL,
        dueAt TEXT
      );

      CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        studentUserId TEXT NOT NULL,
        assignmentId TEXT NOT NULL,
        startsAt TEXT NOT NULL,
        endsAt TEXT,
        visibility TEXT NOT NULL,
        FOREIGN KEY (studentUserId) REFERENCES users(id),
        FOREIGN KEY (assignmentId) REFERENCES assignments(id)
      );

      CREATE TABLE IF NOT EXISTS friendships (
        id TEXT PRIMARY KEY,
        requesterUserId TEXT NOT NULL,
        addresseeUserId TEXT NOT NULL,
        status TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (requesterUserId) REFERENCES users(id),
        FOREIGN KEY (addresseeUserId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS attempts (
        id TEXT PRIMARY KEY,
        assignmentId TEXT NOT NULL,
        userId TEXT NOT NULL,
        mode TEXT NOT NULL,
        state TEXT,
        score REAL,
        startedAt TEXT NOT NULL,
        endedAt TEXT,
        FOREIGN KEY (assignmentId) REFERENCES assignments(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        attemptId TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT NOT NULL,
        submittedAt TEXT NOT NULL,
        FOREIGN KEY (attemptId) REFERENCES attempts(id)
      );

      CREATE TABLE IF NOT EXISTS gamification_profiles (
        id TEXT PRIMARY KEY,
        userId TEXT UNIQUE NOT NULL,
        points INTEGER DEFAULT 0,
        level INTEGER,
        theme TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS points_ledger (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        delta INTEGER NOT NULL,
        reason TEXT NOT NULL,
        meta TEXT,
        at TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        key TEXT NOT NULL,
        name TEXT NOT NULL,
        earnedAt TEXT NOT NULL,
        meta TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);
  }

  async run(sql: string, params?: any[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync(sql, params || []);
  }

  async get<T>(sql: string, params?: any[]): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.getFirstAsync<T>(sql, params || []);
    return result || null;
  }

  async all<T>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAllAsync<T>(sql, params || []);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const sqliteDb = new SQLiteDatabase();
