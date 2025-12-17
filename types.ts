
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
  level: MoroccanLevel;
  subject: string;
  phone: string;
  status: 'Paid' | 'Unpaid' | 'Pending';
  enrollmentDate: string;
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

export interface ClassSession {
  id: string;
  subject: string;
  teacher: string;
  time: string;
  day: string;
  studentsCount: number;
  room: string;
}

export interface Translations {
  [key: string]: {
    ar: string;
    fr: string;
  };
}
