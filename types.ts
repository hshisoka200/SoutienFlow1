

export interface ScheduleEntry {
  day: string;
  start: string;
  end: string;
}

export type TabType = 'dashboard' | 'students' | 'payments' | 'classes' | 'billing';
export type Language = 'ar' | 'fr';
export type Theme = 'light' | 'dark';

export type MoroccanLevel =
  | '1AP' | '2AP' | '3AP' | '4AP' | '5AP' | '6AP'
  | '1AC' | '2AC' | '3AC'
  | 'Tronc Commun' | '1BAC' | '2BAC';

export interface Student {
  id: string;
  name: string;
  full_name?: string; // Supabase column match
  level: MoroccanLevel;
  subject: string | string[];
  phone: string;
  status: 'Paid' | 'Unpaid' | 'Pending';
  payment_status?: string; // Supabase column match
  paid_at?: string;
  enrollmentDate: string;
  user_id?: string;
  discount?: number;
  total_price?: number;
  enrollments?: Enrollment[]; // Use structured data
  class_id?: string | string[]; // Link to class(es)
}

export interface Enrollment {
  subject: string;
  level: string; // Captured at enrollment time
  teacherId?: string;
  teacherName?: string;
  price: number;
  schedule?: string;
}

export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  phone?: string;
}

export interface PricingRule {
  id: string;
  subject: string;
  level: MoroccanLevel;
  price: number;
  teacherId?: string;
  teacherName?: string;
}

export interface Class {
  id: string;
  user_id: string;
  class_name: string;
  subject: string;
  level: string;
  teacher_id?: string;
  teacher_name?: string;
  day?: string; // Legacy support
  schedule_time: string | ScheduleEntry[]; // JSON or array support
  max_capacity: number;
  current_students: number;
  active: boolean;
  created_at?: string;
}

export interface Attendance {
  id: string;
  class_id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent';
}

export interface Alert {
  id: string;
  type: 'expiry' | 'delete';
  message: string;
  studentId?: string;
  studentName?: string;
  daysOverdue?: number;
  data?: any;
  timestamp: Date;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending';
  method: 'Cash' | 'Transfer' | 'Check';
}

export interface Translations {
  [key: string]: {
    ar: string;
    fr: string;
  };
}
