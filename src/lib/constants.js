export const DIRECTOR_EMAIL = import.meta.env.VITE_DIRECTOR_EMAIL || 'jpaullasisi@gmail.com'

export const ROLES = {
  DIRECTOR: 'director',
  PRINCIPAL: 'principal',
  BURSAR: 'bursar',
  CLASS_TEACHER: 'class_teacher',
  SUBJECT_TEACHER: 'subject_teacher',
}

export const ROLE_LABELS = {
  director: 'Director',
  principal: 'Principal',
  bursar: 'Bursar',
  class_teacher: 'Class Teacher',
  subject_teacher: 'Subject Teacher',
}

export const ANNEXES = ['Lagos', 'Mowe']

export const DEFAULT_CLASSES = [
  { name: 'Pre-Nursery', level: 'nursery',   sort_order: 1 },
  { name: 'Nursery 1',   level: 'nursery',   sort_order: 2 },
  { name: 'Nursery 2',   level: 'nursery',   sort_order: 3 },
  { name: 'Primary 1',   level: 'primary',   sort_order: 4 },
  { name: 'Primary 2',   level: 'primary',   sort_order: 5 },
  { name: 'Primary 3',   level: 'primary',   sort_order: 6 },
  { name: 'Primary 4',   level: 'primary',   sort_order: 7 },
  { name: 'Primary 5',   level: 'primary',   sort_order: 8 },
  { name: 'JSS 1',       level: 'secondary', sort_order: 9 },
  { name: 'JSS 2',       level: 'secondary', sort_order: 10 },
  { name: 'JSS 3',       level: 'secondary', sort_order: 11 },
  { name: 'SS 1',        level: 'secondary', sort_order: 12 },
  { name: 'SS 2',        level: 'secondary', sort_order: 13 },
  { name: 'SS 3',        level: 'secondary', sort_order: 14 },
]

export const TERM_NAMES = {
  1: 'First Term',
  2: 'Second Term',
  3: 'Third Term',
}

export const TERM_DATES = {
  1: { label: 'September – December', start_month: 9,  end_month: 12 },
  2: { label: 'January – March',      start_month: 1,  end_month: 3  },
  3: { label: 'April – July',         start_month: 4,  end_month: 7  },
}

export const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'POS', 'Cheque']

export const STUDENT_TYPES = { new: 'New Intake', returning: 'Returning Student' }

export const COLORS = {
  burgundy: '#8B1A2F',
  gold: '#C9A84C',
  cream: '#FDF8F0',
}
