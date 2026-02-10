
export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  prerequisites: string[];
  category: string;
}

export interface StudentProfile {
  name: string;
  major: string;
  completedCourses: string[]; // List of course codes
  interests: string[];
  careerGoal: string;
  totalCreditsEarned: number;
  currentGPA: number;
}

export interface LearningPathStep {
  term: string;
  courses: Course[];
  reasoning: string;
}

export interface LearningPath {
  studentName: string;
  major: string;
  steps: LearningPathStep[];
  overallStrategy: string;
  estimatedTimeToCompletion: string;
}

export type AppView = 'setup' | 'profile' | 'path' | 'advisor';
