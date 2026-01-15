import { makeAutoObservable, runInAction } from 'mobx';
import { ReadingAssignment, AssignmentSubmission } from '../../domain/entities/assignment';
import { SupabaseAssignmentRepository } from '../../data/supabase/SupabaseAssignmentRepository';
import { ID } from '../../shared/types';

/**
 * ViewModel for managing reading assignments
 * Handles assignment creation, fetching, and submission workflows
 */
export class ReadingAssignmentViewModel {
  private repository: SupabaseAssignmentRepository;

  // Assignment editing state
  assignments: ReadingAssignment[] = [];
  currentAssignment: ReadingAssignment | null = null;
  
  // Form state for creating/editing assignment
  formData: {
    title: string;
    description?: string;
    content: any; // Paragraph with words and actions
    tools: string[];
    durationMinutes?: number;
    parentEncouragement?: string;
    zombieGifts?: any[];
    dueDate?: Date;
  } = {
    title: '',
    content: null,
    tools: [],
  };

  // Student submission state
  submissions: AssignmentSubmission[] = [];
  currentSubmission: AssignmentSubmission | null = null;

  // Loading and error states
  isLoading = false;
  error: string | null = null;

  // Filter state
  filterDueDate: { year?: number; month?: number; day?: number } = {};

  constructor() {
    this.repository = new SupabaseAssignmentRepository();
    makeAutoObservable(this);
  }

  // ============================================
  // ASSIGNMENT LOADING
  // ============================================

  async loadAssignmentsBySubject(subjectId: ID): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.repository.getReadingAssignmentsBySubjectId(subjectId);
      runInAction(() => {
        if (result.ok) {
          this.assignments = result.value;
        } else {
          this.error = result.error;
        }
        this.isLoading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
    }
  }

  async loadAssignmentsByTutor(tutorId: ID): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.repository.getReadingAssignmentsByTutorId(tutorId);
      runInAction(() => {
        if (result.ok) {
          this.assignments = result.value;
        } else {
          this.error = result.error;
        }
        this.isLoading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
    }
  }

  async loadAssignmentById(assignmentId: ID): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.repository.getReadingAssignmentById(assignmentId);
      if (result.ok) {
        this.currentAssignment = result.value;
      } else {
        this.error = result.error;
      }
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  // ============================================
  // FORM MANAGEMENT
  // ============================================

  setFormField<K extends keyof typeof this.formData>(key: K, value: any): void {
    this.formData[key] = value;
  }

  setFormTitle(title: string): void {
    this.formData.title = title;
  }

  setFormDescription(description: string): void {
    this.formData.description = description;
  }

  setFormContent(content: any): void {
    this.formData.content = content;
  }

  setFormTools(tools: string[]): void {
    this.formData.tools = tools;
  }

  setFormDuration(minutes: number): void {
    this.formData.durationMinutes = minutes;
  }

  setFormParentEncouragement(message: string): void {
    this.formData.parentEncouragement = message;
  }

  setFormZombieGifts(gifts: any[]): void {
    this.formData.zombieGifts = gifts;
  }

  setFormDueDate(date: Date | undefined): void {
    this.formData.dueDate = date;
  }

  resetForm(): void {
    this.formData = {
      title: '',
      content: null,
      tools: [],
    };
    this.error = null;
  }

  // ============================================
  // ASSIGNMENT OPERATIONS
  // ============================================

  async createAssignment(tutorId: ID, subjectId: ID): Promise<boolean> {
    if (!this.formData.title || !this.formData.content) {
      this.error = 'Title and content are required';
      return false;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.repository.createReadingAssignment(tutorId, subjectId, {
        title: this.formData.title,
        description: this.formData.description,
        content: this.formData.content,
        tools: this.formData.tools,
        durationMinutes: this.formData.durationMinutes,
        parentEncouragement: this.formData.parentEncouragement,
        zombieGifts: this.formData.zombieGifts,
        dueDate: this.formData.dueDate,
      });

      if (result.ok) {
        this.currentAssignment = result.value;
        this.assignments.push(result.value);
        this.resetForm();
        return true;
      } else {
        this.error = result.error;
        return false;
      }
    } catch (error: any) {
      this.error = error.message;
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  async updateAssignment(assignmentId: ID, updates: Partial<ReadingAssignment>): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.repository.updateReadingAssignment(assignmentId, updates);

      if (result.ok) {
        const updated = result.value;
        
        // Update in assignments array
        const index = this.assignments.findIndex(a => a.id === assignmentId);
        if (index !== -1) {
          this.assignments[index] = updated;
        }

        // Update current assignment
        if (this.currentAssignment?.id === assignmentId) {
          this.currentAssignment = updated;
        }

        return true;
      } else {
        this.error = result.error;
        return false;
      }
    } catch (error: any) {
      this.error = error.message;
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  async deleteAssignment(assignmentId: ID): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.repository.deleteReadingAssignment(assignmentId);

      if (result.ok) {
        // Remove from assignments array
        this.assignments = this.assignments.filter(a => a.id !== assignmentId);

        // Clear current assignment
        if (this.currentAssignment?.id === assignmentId) {
          this.currentAssignment = null;
        }

        return true;
      } else {
        this.error = result.error;
        return false;
      }
    } catch (error: any) {
      this.error = error.message;
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  // ============================================
  // SUBMISSION OPERATIONS
  // ============================================

  async submitAssignment(
    assignmentId: ID,
    studentId: ID,
    answers: Record<string, any>
  ): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.repository.submitAssignment(assignmentId, studentId, answers);

      if (result.ok) {
        this.currentSubmission = result.value;
        return true;
      } else {
        this.error = result.error;
        return false;
      }
    } catch (error: any) {
      this.error = error.message;
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  async loadStudentSubmissions(studentId: ID): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.repository.getStudentSubmissions(studentId);

      if (result.ok) {
        this.submissions = result.value;
      } else {
        this.error = result.error;
      }
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async loadAssignmentSubmissions(assignmentId: ID): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.repository.getAssignmentSubmissions(assignmentId);

      if (result.ok) {
        this.submissions = result.value;
      } else {
        this.error = result.error;
      }
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async gradeSubmission(
    submissionId: ID,
    score: number,
    feedback?: string
  ): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.repository.gradeSubmission(submissionId, score, feedback);

      if (result.ok) {
        const graded = result.value;

        // Update in submissions array
        const index = this.submissions.findIndex(s => s.id === submissionId);
        if (index !== -1) {
          this.submissions[index] = graded;
        }

        // Update current submission
        if (this.currentSubmission?.id === submissionId) {
          this.currentSubmission = graded;
        }

        return true;
      } else {
        this.error = result.error;
        return false;
      }
    } catch (error: any) {
      this.error = error.message;
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  // ============================================
  // IMAGE MANAGEMENT
  // ============================================

  async addAssignmentImage(
    assignmentId: ID,
    wordId: string,
    imageUrl: string,
    imageSource: 'google' | 'phone_upload' | 'library',
    altText?: string
  ): Promise<boolean> {
    try {
      const result = await this.repository.addAssignmentImage(
        assignmentId,
        wordId,
        imageUrl,
        imageSource,
        altText
      );

      if (!result.ok) {
        this.error = result.error;
        return false;
      }

      return true;
    } catch (error: any) {
      this.error = error.message;
      return false;
    }
  }

  async deleteAssignmentImage(imageId: ID): Promise<boolean> {
    try {
      const result = await this.repository.deleteAssignmentImage(imageId);

      if (!result.ok) {
        this.error = result.error;
        return false;
      }

      return true;
    } catch (error: any) {
      this.error = error.message;
      return false;
    }
  }

  // ============================================
  // CONTENT BUILDING HELPERS
  // ============================================

  /**
   * Build reading assignment content from paragraph text with word actions
   */
  buildAssignmentContent(
    paragraph: string,
    wordActions: Map<string, any> // word_id -> action data
  ): any {
    // Split paragraph into sentences
    const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];

    // First pass: filter and build sentences
    const filteredSentences = sentences
      .map((sentence) => {
        const trimmed = sentence.trim();
        if (!trimmed) return null;

        const words = trimmed.split(/\s+/).filter(w => w.length > 0);
        if (words.length === 0) return null;

        return {
          sentenceText: trimmed,
          words,
        };
      })
      .filter((s) => s !== null) as Array<{ sentenceText: string; words: string[] }>;

    // Second pass: build final structure with correct indices
    const content = {
      originalParagraph: paragraph,
      sentences: filteredSentences.map((sentenceData, sentenceIdx) => {
        return {
          sentenceId: `s${sentenceIdx}`,
          sentenceText: sentenceData.sentenceText,
          words: sentenceData.words.map((word, wordIdx) => {
            const wordId = `s${sentenceIdx}_w${wordIdx}`;
            const action = wordActions.get(wordId);

            return {
              wordId,
              wordText: word,
              text: word, // Keep both for compatibility
              position: wordIdx,
              action: action || null, // Will be assigned later
            };
          }),
        };
      }),
    };

    return content;
  }

  /**
   * Add an action to a specific word in the content
   */
  assignWordAction(
    content: any,
    wordId: string,
    action: {
      type: 'define' | 'illustrate' | 'fill';
      data: any;
    }
  ): any {
    const [sentenceIdx, wordIdx] = wordId.split('_').map(v => parseInt(v.substring(1)));

    if (content.sentences[sentenceIdx]) {
      const word = content.sentences[sentenceIdx].words[wordIdx];
      if (word) {
        word.action = action;
      }
    }

    return content;
  }

  /**
   * Get all word IDs with actions from content
   */
  getWordsWithActions(content: any): Array<{ wordId: string; action: any }> {
    const words: Array<{ wordId: string; action: any }> = [];

    if (!content?.sentences) return words;

    content.sentences.forEach((sentence: any) => {
      if (sentence.words) {
        sentence.words.forEach((word: any) => {
          if (word.action) {
            words.push({
              wordId: word.wordId,
              action: word.action,
            });
          }
        });
      }
    });

    return words;
  }

  // ============================================
  // DATE FILTERING
  // ============================================

  /**
   * Set date filter (year, month, day)
   * Filters assignments by due date
   */
  setDateFilter(year?: number, month?: number, day?: number): void {
    this.filterDueDate = { year, month, day };
  }

  /**
   * Clear all date filters
   */
  clearDateFilter(): void {
    this.filterDueDate = {};
  }

  /**
   * Get filtered assignments based on date filters
   */
  getFilteredAssignments(): ReadingAssignment[] {
    if (!this.filterDueDate.year && !this.filterDueDate.month && !this.filterDueDate.day) {
      return this.assignments;
    }

    return this.assignments.filter((assignment) => {
      if (!assignment.dueDate) return false;

      const dueDate = new Date(assignment.dueDate);
      const dueYear = dueDate.getFullYear();
      const dueMonth = dueDate.getMonth() + 1; // getMonth is 0-indexed
      const dueDay = dueDate.getDate();

      if (this.filterDueDate.year && dueYear !== this.filterDueDate.year) return false;
      if (this.filterDueDate.month && dueMonth !== this.filterDueDate.month) return false;
      if (this.filterDueDate.day && dueDay !== this.filterDueDate.day) return false;

      return true;
    });
  }
}

// Export singleton instance
export const readingAssignmentViewModel = new ReadingAssignmentViewModel();
