
import { Student, Payment, ClassSession, Translations } from './types';

export const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Amine El Amrani', level: '2BAC', subject: 'Math', phone: '+212600112233', status: 'Paid', enrollmentDate: '2023-09-01' },
  { id: '2', name: 'Salma Bennani', level: '1BAC', subject: 'Physics', phone: '+212644556677', status: 'Unpaid', enrollmentDate: '2023-09-05' },
  { id: '3', name: 'Youssef Mansouri', level: '3AC', subject: 'French', phone: '+212611223344', status: 'Paid', enrollmentDate: '2023-10-12' },
  { id: '4', name: 'Layla Tazi', level: 'Tronc Commun', subject: 'SVT', phone: '+212699887766', status: 'Pending', enrollmentDate: '2023-11-20' },
  { id: '5', name: 'Omar Kadiri', level: '2BAC', subject: 'Physics', phone: '+212711001122', status: 'Paid', enrollmentDate: '2023-08-15' },
  { id: '6', name: 'Kenza Alaoui', level: '6AP', subject: 'Arabic', phone: '+212677889900', status: 'Paid', enrollmentDate: '2024-01-10' },
  { id: '7', name: 'Mehdi Chraibi', level: '1AC', subject: 'Math', phone: '+212655443322', status: 'Unpaid', enrollmentDate: '2024-02-01' },
  { id: '8', name: 'Sami Joundy', level: '1AP', subject: 'Francais', phone: '+212600000001', status: 'Paid', enrollmentDate: '2024-03-01' },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', studentId: '1', studentName: 'Amine El Amrani', amount: 800, date: '2024-03-01', status: 'Completed', method: 'Cash' },
  { id: 'p2', studentId: '3', studentName: 'Youssef Mansouri', amount: 600, date: '2024-03-02', status: 'Completed', method: 'Transfer' },
  { id: 'p3', studentId: '5', studentName: 'Omar Kadiri', amount: 1200, date: '2024-02-28', status: 'Completed', method: 'Check' },
];

export const MOCK_CLASSES: ClassSession[] = [
  { id: 'c1', subject: 'Math', teacher: 'Pr. Alami', time: '18:00 - 20:00', day: 'Lundi', studentsCount: 12, room: 'Salle 1' },
  { id: 'c2', subject: 'Physics', teacher: 'Pr. Benali', time: '16:00 - 18:00', day: 'Mercredi', studentsCount: 8, room: 'Salle 3' },
  { id: 'c3', subject: 'SVT', teacher: 'Pr. Zahra', time: '10:00 - 12:00', day: 'Samedi', studentsCount: 15, room: 'Salle 2' },
];

export const TRANSLATIONS: Translations = {
  dashboard: { ar: 'لوحة القيادة', fr: 'Tableau de bord' },
  students: { ar: 'الطلاب', fr: 'Étudiants' },
  payments: { ar: 'المدفوعات', fr: 'Paiements' },
  classes: { ar: 'الحصص', fr: 'Classes' },
  billing: { ar: 'الفواتير', fr: 'Facturation' },
  all_levels: { ar: 'جميع المستويات', fr: 'Tous les niveaux' },
  all_subjects: { ar: 'جميع المواد', fr: 'Toutes les matières' },
  all_statuses: { ar: 'جميع الحالات', fr: 'Tous les statuts' },
  search: { ar: 'بحث...', fr: 'Recherche...' },
  
  // Categories
  primary: { ar: 'الابتدائي', fr: 'Primaire' },
  middle: { ar: 'الإعدادي', fr: 'Collège' },
  high: { ar: 'الثانوي', fr: 'Lycée' },

  // Levels Primary
  '1AP': { ar: 'أولى ابتدائي', fr: '1AP' },
  '2AP': { ar: 'ثانية ابتدائي', fr: '2AP' },
  '3AP': { ar: 'ثالثة ابتدائي', fr: '3AP' },
  '4AP': { ar: 'رابعة ابتدائي', fr: '4AP' },
  '5AP': { ar: 'خامسة ابتدائي', fr: '5AP' },
  '6AP': { ar: 'سادسة ابتدائي', fr: '6AP' },

  // Levels Middle
  '1AC': { ar: 'أولى إعدادي', fr: '1AC' },
  '2AC': { ar: 'ثانية إعدادي', fr: '2AC' },
  '3AC': { ar: 'ثالثة إعدادي', fr: '3AC' },

  // Levels High
  'Tronc Commun': { ar: 'جذع مشترك', fr: 'Tronc Commun' },
  '1BAC': { ar: 'أولى باك', fr: '1BAC' },
  '2BAC': { ar: 'ثانية باك', fr: '2BAC' },

  paid: { ar: 'مدفوع', fr: 'Payé' },
  unpaid: { ar: 'غير مدفوع', fr: 'Impayé' },
  pending: { ar: 'قيد الانتظار', fr: 'En attente' },
  subscribe_title: { ar: 'الاشتراك مطلوب', fr: 'Abonnement requis' },
  subscribe_desc: { ar: 'يرجى تفعيل اشتراكك لمتابعة استخدام SoutienFlow.', fr: 'Veuillez activer votre abonnement pour continuer à utiliser SoutienFlow.' },
  price_month: { ar: '300 درهم / شهر', fr: '300 MAD / mois' },
  subscribe_now: { ar: 'اشترك الآن', fr: 'S\'abonner maintenant' },
  name: { ar: 'الاسم', fr: 'Nom' },
  level: { ar: 'المستوى', fr: 'Niveau' },
  subject: { ar: 'المادة', fr: 'Matière' },
  phone: { ar: 'الهاتف', fr: 'Téléphone' },
  status: { ar: 'الحالة', fr: 'Statut' },
  new_student: { ar: 'طالب جديد', fr: 'Nouveau étudiant' },
};
