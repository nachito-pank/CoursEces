import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Field {
  id: string;
  name: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface CourseField {
  id: string;
  course_id: string;
  field_id: string;
  created_at: string;
  field?: Field;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  level: string;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
  updated_at: string;
  teacher?: Teacher;
  course_fields?: CourseField[];
  fields?: Field[];
}

export const COURSE_LEVELS = [
  'Licence 1',
  'Licence 2',
  'Licence 3',
  'Master 1',
  'Master 2',
  'Doctorat',
  'Formation Continue',
] as const;
