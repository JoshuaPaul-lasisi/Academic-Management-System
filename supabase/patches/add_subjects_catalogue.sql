-- ============================================================
-- Patch: Add subjects_catalogue to existing production schema
-- Run in your EXISTING Supabase project (the one with INTEGER IDs)
-- Safe to run multiple times — uses ON CONFLICT DO NOTHING
-- ============================================================

-- 1. Create the reference table
CREATE TABLE IF NOT EXISTS public.subjects_catalogue (
  id          SERIAL PRIMARY KEY,
  class_level TEXT NOT NULL CHECK (class_level IN ('nursery', 'primary', 'jss', 'ss')),
  subject     TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  UNIQUE (class_level, subject)
);

-- 2. Seed Nursery subjects
INSERT INTO public.subjects_catalogue (class_level, subject, sort_order) VALUES
  ('nursery', 'Literacy',               1),
  ('nursery', 'Numeracy',               2),
  ('nursery', 'Creative Arts',          3),
  ('nursery', 'Music & Rhymes',         4),
  ('nursery', 'Physical Education',     5),
  ('nursery', 'Environmental Studies',  6)
ON CONFLICT (class_level, subject) DO NOTHING;

-- 3. Seed Primary subjects
INSERT INTO public.subjects_catalogue (class_level, subject, sort_order) VALUES
  ('primary', 'English Language',             1),
  ('primary', 'Mathematics',                  2),
  ('primary', 'Basic Science & Technology',   3),
  ('primary', 'Social Studies',               4),
  ('primary', 'Civic Education',              5),
  ('primary', 'Christian Religious Studies',  6),
  ('primary', 'Islamic Religious Studies',    7),
  ('primary', 'Computer Studies',             8),
  ('primary', 'Cultural & Creative Arts',     9),
  ('primary', 'Physical & Health Education', 10),
  ('primary', 'Yoruba Language',             11),
  ('primary', 'French Language',             12)
ON CONFLICT (class_level, subject) DO NOTHING;

-- 4. Seed JSS subjects (Business Studies + Literature in English added)
INSERT INTO public.subjects_catalogue (class_level, subject, sort_order) VALUES
  ('jss', 'English Language',             1),
  ('jss', 'Mathematics',                  2),
  ('jss', 'Basic Science',                3),
  ('jss', 'Basic Technology',             4),
  ('jss', 'Social Studies',               5),
  ('jss', 'Civic Education',              6),
  ('jss', 'Christian Religious Studies',  7),
  ('jss', 'Islamic Religious Studies',    8),
  ('jss', 'Business Studies',             9),   -- ← Added
  ('jss', 'Agricultural Science',        10),
  ('jss', 'Home Economics',              11),
  ('jss', 'Computer Studies',            12),
  ('jss', 'Physical & Health Education', 13),
  ('jss', 'Cultural & Creative Arts',    14),
  ('jss', 'Literature in English',       15),   -- ← Added
  ('jss', 'French Language',             16),
  ('jss', 'Yoruba Language',             17)
ON CONFLICT (class_level, subject) DO NOTHING;

-- 5. Seed SS subjects
INSERT INTO public.subjects_catalogue (class_level, subject, sort_order) VALUES
  ('ss', 'English Language',             1),
  ('ss', 'Mathematics',                  2),
  ('ss', 'Biology',                      3),
  ('ss', 'Chemistry',                    4),
  ('ss', 'Physics',                      5),
  ('ss', 'Agricultural Science',         6),
  ('ss', 'Economics',                    7),
  ('ss', 'Government',                   8),
  ('ss', 'Literature in English',        9),
  ('ss', 'Christian Religious Studies', 10),
  ('ss', 'Islamic Religious Studies',   11),
  ('ss', 'Geography',                   12),
  ('ss', 'Commerce',                    13),
  ('ss', 'Accounting',                  14),
  ('ss', 'Computer Studies',            15),
  ('ss', 'Further Mathematics',         16),
  ('ss', 'French Language',             17),
  ('ss', 'Yoruba Language',             18),
  ('ss', 'Technical Drawing',           19)
ON CONFLICT (class_level, subject) DO NOTHING;

-- 6. Verify — run this SELECT to confirm JSS subjects were inserted:
-- SELECT subject FROM public.subjects_catalogue
-- WHERE class_level = 'jss'
-- ORDER BY sort_order;
