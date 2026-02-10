
import { Course } from './types';

export const SAMPLE_CATALOG: Course[] = [
  { id: '1', code: 'CS101', title: 'Introduction to Programming', description: 'Fundamentals of computer science and basic coding logic.', credits: 3, prerequisites: [], category: 'Core' },
  { id: '2', code: 'CS102', title: 'Data Structures', description: 'Advanced organization of data for efficient processing.', credits: 4, prerequisites: ['CS101'], category: 'Core' },
  { id: '3', code: 'CS201', title: 'Algorithms', description: 'Design and analysis of computational procedures.', credits: 4, prerequisites: ['CS102'], category: 'Core' },
  { id: '4', code: 'MATH150', title: 'Calculus I', description: 'Differential calculus and its applications.', credits: 4, prerequisites: [], category: 'Math' },
  { id: '5', code: 'MATH151', title: 'Calculus II', description: 'Integral calculus and series.', credits: 4, prerequisites: ['MATH150'], category: 'Math' },
  { id: '6', code: 'CS310', title: 'Artificial Intelligence', description: 'Principles of machine learning and heuristic search.', credits: 3, prerequisites: ['CS201', 'MATH151'], category: 'Elective' },
  { id: '7', code: 'CS320', title: 'Web Development', description: 'Full-stack application building with modern frameworks.', credits: 3, prerequisites: ['CS102'], category: 'Elective' },
  { id: '8', code: 'CS401', title: 'Software Engineering', description: 'Large-scale system design and project management.', credits: 4, prerequisites: ['CS201'], category: 'Core' },
  { id: '9', code: 'CS410', title: 'Deep Learning', description: 'Neural network architectures and computer vision.', credits: 3, prerequisites: ['CS310'], category: 'Elective' },
  { id: '10', code: 'PSYCH101', title: 'Intro to Psychology', description: 'Basic study of human behavior and mind.', credits: 3, prerequisites: [], category: 'General' }
];

export const INITIAL_PROFILE = {
  name: 'Alex Rivera',
  major: 'Computer Science',
  completedCourses: ['CS101', 'MATH150'],
  interests: ['Machine Learning', 'UX Design', 'Ethical AI'],
  careerGoal: 'AI Research Scientist',
  totalCreditsEarned: 7,
  currentGPA: 3.8
};
