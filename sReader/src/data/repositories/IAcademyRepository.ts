import { Result } from '../../shared/result';
import { Page } from '../../shared/types';
import { Academy, Class, Enrollment } from '../../domain/entities/academy';

export interface IAcademyRepository {
  createAcademy(a: Omit<Academy, 'id'>): Promise<Result<Academy>>;
  getAcademy(id: string): Promise<Result<Academy>>;
  listAcademies(page?: number, pageSize?: number): Promise<Result<Page<Academy>>>;
  updateAcademy(a: Academy): Promise<Result<Academy>>;
  deleteAcademy(id: string): Promise<Result<boolean>>;

  createClass(c: Omit<Class, 'id'>): Promise<Result<Class>>;
  getClass(id: string): Promise<Result<Class>>;
  listClasses(academyId: string, page?: number, pageSize?: number): Promise<Result<Page<Class>>>;
  updateClass(c: Class): Promise<Result<Class>>;
  deleteClass(id: string): Promise<Result<boolean>>;

  enroll(e: Omit<Enrollment, 'id'>): Promise<Result<Enrollment>>;
  listEnrollments(classId: string): Promise<Result<Enrollment[]>>;
  unenroll(id: string): Promise<Result<boolean>>;
}
