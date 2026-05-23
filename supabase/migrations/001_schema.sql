-- ============================================================
-- Debbyfield Schools Management System — Full Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- ─── PROFILES (extends auth.users) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'pending'
                CHECK (role IN ('director','principal','bursar','class_teacher','subject_teacher','pending')),
  annex_access TEXT NOT NULL DEFAULT 'both'
                CHECK (annex_access IN ('Lagos','Mowe','both')),
  is_active   BOOLEAN DEFAULT TRUE,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SCHOOLS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.schools (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL DEFAULT 'Debbyfield Schools',
  setup_complete BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ANNEXES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.annexes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  address   TEXT,
  phone     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (school_id, name)
);

-- ─── ACADEMIC SESSIONS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.academic_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,  -- e.g. '2026/2027'
  start_year INTEGER NOT NULL,
  end_year   INTEGER NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (name)
);

-- ─── TERMS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.terms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  term_number  INTEGER NOT NULL CHECK (term_number IN (1,2,3)),
  name         TEXT NOT NULL,
  start_date   DATE,
  end_date     DATE,
  is_current   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, term_number)
);

-- ─── CLASSES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.classes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  level      TEXT NOT NULL CHECK (level IN ('nursery','primary','secondary')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (name)
);

-- ─── CLASS ↔ ANNEX MAPPING ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.class_annexes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id  UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  annex_id  UUID REFERENCES public.annexes(id) ON DELETE CASCADE,
  UNIQUE (class_id, annex_id)
);

-- ─── SUBJECTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subjects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  class_id   UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  annex_id   UUID REFERENCES public.annexes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (name, class_id, annex_id)
);

-- ─── TEACHER ASSIGNMENTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id         UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id       UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  annex_id         UUID REFERENCES public.annexes(id) ON DELETE CASCADE,
  is_class_teacher BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (teacher_id, class_id, annex_id)
);

-- ─── STUDENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.students (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  middle_name           TEXT,
  date_of_birth         DATE,
  gender                TEXT CHECK (gender IN ('male','female')),
  class_id              UUID REFERENCES public.classes(id),
  annex_id              UUID REFERENCES public.annexes(id),
  admission_number      TEXT UNIQUE,
  admission_date        DATE,
  student_type          TEXT CHECK (student_type IN ('new','returning')) DEFAULT 'new',
  photo_url             TEXT,
  medical_notes         TEXT,
  is_active             BOOLEAN DEFAULT TRUE,
  is_alumni             BOOLEAN DEFAULT FALSE,
  alumni_exit_year      INTEGER,
  alumni_next_destination TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PARENT / GUARDIAN ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.parent_guardians (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID REFERENCES public.students(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  is_primary   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FEE STRUCTURES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id     UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  term_id      UUID REFERENCES public.terms(id) ON DELETE CASCADE,
  annex_id     UUID REFERENCES public.annexes(id) ON DELETE CASCADE,
  student_type TEXT NOT NULL CHECK (student_type IN ('new','returning')),
  tuition_fee  NUMERIC(12,2) DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_id, term_id, annex_id, student_type)
);

-- ─── FEE LEVIES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fee_levies (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_structure_id   UUID REFERENCES public.fee_structures(id) ON DELETE CASCADE,
  levy_name          TEXT NOT NULL,
  amount             NUMERIC(12,2) DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STUDENT FEE ACCOUNTS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_fee_accounts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE,
  term_id     UUID REFERENCES public.terms(id) ON DELETE CASCADE,
  total_owed  NUMERIC(12,2) DEFAULT 0,
  total_paid  NUMERIC(12,2) DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, term_id)
);

-- ─── FEE PAYMENTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fee_payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID REFERENCES public.students(id) ON DELETE CASCADE,
  term_id        UUID REFERENCES public.terms(id),
  amount         NUMERIC(12,2) NOT NULL,
  payment_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT CHECK (payment_method IN ('Cash','Bank Transfer','POS','Cheque')),
  recorded_by    UUID REFERENCES public.profiles(id),
  receipt_number TEXT UNIQUE,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STAFF ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  annex_id       UUID REFERENCES public.annexes(id),
  staff_number   TEXT UNIQUE,
  date_joined    DATE,
  salary         NUMERIC(12,2) DEFAULT 0,
  bank_name      TEXT,
  account_number TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STAFF ATTENDANCE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  date     DATE NOT NULL,
  time_in  TIME,
  time_out TIME,
  status   TEXT NOT NULL CHECK (status IN ('present','absent','late','leave')) DEFAULT 'present',
  notes    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (staff_id, date)
);

-- ─── PAYROLL ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payroll (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id      UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  month         INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year          INTEGER NOT NULL,
  basic_salary  NUMERIC(12,2) DEFAULT 0,
  allowances    NUMERIC(12,2) DEFAULT 0,
  deductions    NUMERIC(12,2) DEFAULT 0,
  net_pay       NUMERIC(12,2) DEFAULT 0,
  payment_date  DATE,
  is_paid       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (staff_id, month, year)
);

-- ─── STUDENT ATTENDANCE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_attendance (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID REFERENCES public.students(id) ON DELETE CASCADE,
  class_id     UUID REFERENCES public.classes(id),
  date         DATE NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('present','absent','late')) DEFAULT 'present',
  recorded_by  UUID REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, date)
);

-- ─── SCHEME OF WORK ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scheme_of_work (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id          UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id            UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  term_id             UUID REFERENCES public.terms(id) ON DELETE CASCADE,
  week_number         INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 14),
  topic               TEXT NOT NULL,
  sub_topics          TEXT,
  learning_objectives TEXT,
  resources           TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (subject_id, class_id, term_id, week_number)
);

-- ─── E-NOTES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.e_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id  UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id    UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  term_id     UUID REFERENCES public.terms(id) ON DELETE CASCADE,
  week_number INTEGER,
  topic       TEXT NOT NULL,
  content     TEXT,
  file_url    TEXT,
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── EXAM QUESTIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id    UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id      UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  term_id       UUID REFERENCES public.terms(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq','theory','fill_blank')),
  question_text TEXT NOT NULL,
  options       JSONB,
  correct_answer TEXT,
  marks         INTEGER DEFAULT 1,
  is_locked     BOOLEAN DEFAULT FALSE,
  created_by    UUID REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ASSESSMENT SCORES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assessment_scores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id   UUID REFERENCES public.classes(id),
  term_id    UUID REFERENCES public.terms(id) ON DELETE CASCADE,
  ca_score   NUMERIC(5,2) DEFAULT 0,
  exam_score NUMERIC(5,2) DEFAULT 0,
  total      NUMERIC(5,2) DEFAULT 0,
  grade      TEXT,
  position   INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, subject_id, term_id)
);

-- ─── CLASS TIMETABLES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.timetables (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id     UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  annex_id     UUID REFERENCES public.annexes(id) ON DELETE CASCADE,
  term_id      UUID REFERENCES public.terms(id) ON DELETE CASCADE,
  day_of_week  INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  period_number INTEGER NOT NULL,
  subject_id   UUID REFERENCES public.subjects(id),
  start_time   TIME,
  end_time     TIME,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INVITATIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invitations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('director','principal','bursar','class_teacher','subject_teacher')),
  annex_access TEXT DEFAULT 'both',
  invited_by UUID REFERENCES public.profiles(id),
  accepted   BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (email)
);

-- ============================================================
-- HELPER FUNCTION: get current user role
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  invited_role TEXT;
  invited_annex TEXT;
BEGIN
  -- Check if there's an invitation for this email
  SELECT role, annex_access INTO invited_role, invited_annex
  FROM public.invitations
  WHERE email = NEW.email AND accepted = FALSE
  LIMIT 1;

  INSERT INTO public.profiles (id, full_name, email, role, annex_access)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.email,
    CASE
      WHEN NEW.email = 'jpaullasisi@gmail.com' THEN 'director'
      WHEN invited_role IS NOT NULL THEN invited_role
      ELSE 'pending'
    END,
    COALESCE(invited_annex, 'both')
  );

  -- Mark invitation as accepted
  IF invited_role IS NOT NULL THEN
    UPDATE public.invitations SET accepted = TRUE WHERE email = NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annexes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_annexes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_guardians   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_levies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fee_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_of_work     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.e_notes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_scores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations        ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own; director/principal can read all
CREATE POLICY "profiles_self_read" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.get_user_role() IN ('director','principal'));

CREATE POLICY "profiles_self_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_director_all" ON public.profiles
  FOR ALL USING (public.get_user_role() = 'director');

-- Schools: all authenticated users can read; director can write
CREATE POLICY "schools_read" ON public.schools
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "schools_write" ON public.schools
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

-- Annexes: all authenticated users can read; director/principal can write
CREATE POLICY "annexes_read" ON public.annexes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "annexes_write" ON public.annexes
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

-- Academic sessions: all authenticated users read; director/principal write
CREATE POLICY "sessions_read" ON public.academic_sessions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "sessions_write" ON public.academic_sessions
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

-- Terms: same
CREATE POLICY "terms_read" ON public.terms
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "terms_write" ON public.terms
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

-- Classes: all read; director/principal write
CREATE POLICY "classes_read" ON public.classes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "classes_write" ON public.classes
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

CREATE POLICY "class_annexes_read" ON public.class_annexes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "class_annexes_write" ON public.class_annexes
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

-- Subjects: all read; director/principal write
CREATE POLICY "subjects_read" ON public.subjects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "subjects_write" ON public.subjects
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

-- Teacher assignments: director/principal full; teachers read own
CREATE POLICY "assignments_admin" ON public.teacher_assignments
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

CREATE POLICY "assignments_self_read" ON public.teacher_assignments
  FOR SELECT USING (teacher_id = auth.uid());

-- Students: director/principal/bursar can read all; teachers read assigned classes
CREATE POLICY "students_admin" ON public.students
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

CREATE POLICY "students_bursar_read" ON public.students
  FOR SELECT USING (public.get_user_role() = 'bursar');

CREATE POLICY "students_teacher_read" ON public.students
  FOR SELECT USING (
    public.get_user_role() IN ('class_teacher','subject_teacher') AND
    class_id IN (
      SELECT class_id FROM public.teacher_assignments WHERE teacher_id = auth.uid()
    )
  );

-- Parent guardians: follow student access
CREATE POLICY "parent_admin" ON public.parent_guardians
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

CREATE POLICY "parent_bursar_read" ON public.parent_guardians
  FOR SELECT USING (public.get_user_role() = 'bursar');

-- Fee structures: director/principal/bursar full access
CREATE POLICY "fees_admin" ON public.fee_structures
  FOR ALL USING (public.get_user_role() IN ('director','principal','bursar'));

CREATE POLICY "fees_read" ON public.fee_structures
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "levies_admin" ON public.fee_levies
  FOR ALL USING (public.get_user_role() IN ('director','principal','bursar'));

CREATE POLICY "levies_read" ON public.fee_levies
  FOR SELECT USING (auth.role() = 'authenticated');

-- Fee accounts & payments: director/principal/bursar full
CREATE POLICY "fee_accounts_admin" ON public.student_fee_accounts
  FOR ALL USING (public.get_user_role() IN ('director','principal','bursar'));

CREATE POLICY "fee_payments_admin" ON public.fee_payments
  FOR ALL USING (public.get_user_role() IN ('director','principal','bursar'));

-- Staff: director/principal full; bursar read; staff can see own
CREATE POLICY "staff_admin" ON public.staff
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

CREATE POLICY "staff_bursar_read" ON public.staff
  FOR SELECT USING (public.get_user_role() = 'bursar');

CREATE POLICY "staff_attendance_admin" ON public.staff_attendance
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

-- Payroll: director/principal/bursar
CREATE POLICY "payroll_admin" ON public.payroll
  FOR ALL USING (public.get_user_role() IN ('director','principal','bursar'));

-- Student attendance: director/principal/class teachers of that class
CREATE POLICY "attendance_admin" ON public.student_attendance
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

CREATE POLICY "attendance_teacher" ON public.student_attendance
  FOR ALL USING (
    public.get_user_role() = 'class_teacher' AND
    class_id IN (
      SELECT class_id FROM public.teacher_assignments WHERE teacher_id = auth.uid()
    )
  );

-- Academic content: director/principal full; teachers manage own; all can read
CREATE POLICY "sow_admin" ON public.scheme_of_work
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

CREATE POLICY "sow_teacher" ON public.scheme_of_work
  FOR ALL USING (
    public.get_user_role() IN ('class_teacher','subject_teacher') AND
    subject_id IN (
      SELECT ta.subject_id FROM public.teacher_assignments ta WHERE ta.teacher_id = auth.uid()
    )
  );

CREATE POLICY "sow_read" ON public.scheme_of_work
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "enotes_admin" ON public.e_notes
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

CREATE POLICY "enotes_teacher" ON public.e_notes
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "enotes_read" ON public.e_notes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "questions_admin" ON public.exam_questions
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

CREATE POLICY "questions_teacher" ON public.exam_questions
  FOR ALL USING (created_by = auth.uid() AND is_locked = FALSE);

CREATE POLICY "questions_read" ON public.exam_questions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "scores_admin" ON public.assessment_scores
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

CREATE POLICY "scores_teacher" ON public.assessment_scores
  FOR ALL USING (
    public.get_user_role() IN ('class_teacher','subject_teacher') AND
    class_id IN (
      SELECT class_id FROM public.teacher_assignments WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "scores_read" ON public.assessment_scores
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "timetables_admin" ON public.timetables
  FOR ALL USING (public.get_user_role() IN ('director','principal'));

CREATE POLICY "timetables_read" ON public.timetables
  FOR SELECT USING (auth.role() = 'authenticated');

-- Invitations: director can manage; users can read own email
CREATE POLICY "invitations_director" ON public.invitations
  FOR ALL USING (public.get_user_role() = 'director');

CREATE POLICY "invitations_read_own" ON public.invitations
  FOR SELECT USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));
