-- Migration 002: Seed default subjects for all existing classes and annexes
-- Safe to run multiple times — uses ON CONFLICT DO NOTHING

DO $$
DECLARE
  cls    RECORD;
  ann    RECORD;
  subj   TEXT;

  nursery_subjects TEXT[] := ARRAY[
    'Literacy', 'Numeracy', 'Creative Arts', 'Music & Rhymes',
    'Physical Education', 'Environmental Studies'
  ];

  primary_subjects TEXT[] := ARRAY[
    'English Language', 'Mathematics', 'Basic Science & Technology',
    'Social Studies', 'Civic Education', 'Christian Religious Studies',
    'Islamic Religious Studies', 'Computer Studies',
    'Cultural & Creative Arts', 'Physical & Health Education',
    'Yoruba Language', 'French Language'
  ];

  jss_subjects TEXT[] := ARRAY[
    'English Language', 'Mathematics', 'Basic Science', 'Basic Technology',
    'Social Studies', 'Civic Education', 'Christian Religious Studies',
    'Islamic Religious Studies', 'Business Studies', 'Agricultural Science',
    'Home Economics', 'Computer Studies', 'Physical & Health Education',
    'Cultural & Creative Arts', 'Literature in English',
    'French Language', 'Yoruba Language'
  ];

  ss_subjects TEXT[] := ARRAY[
    'English Language', 'Mathematics', 'Biology', 'Chemistry', 'Physics',
    'Agricultural Science', 'Economics', 'Government',
    'Literature in English', 'Christian Religious Studies',
    'Islamic Religious Studies', 'Geography', 'Commerce', 'Accounting',
    'Computer Studies', 'Further Mathematics',
    'French Language', 'Yoruba Language', 'Technical Drawing'
  ];

BEGIN
  FOR cls IN SELECT id, name, level FROM public.classes LOOP
    FOR ann IN SELECT id FROM public.annexes LOOP

      IF cls.level = 'nursery' THEN
        FOREACH subj IN ARRAY nursery_subjects LOOP
          INSERT INTO public.subjects (name, class_id, annex_id)
          VALUES (subj, cls.id, ann.id)
          ON CONFLICT (name, class_id, annex_id) DO NOTHING;
        END LOOP;

      ELSIF cls.level = 'primary' THEN
        FOREACH subj IN ARRAY primary_subjects LOOP
          INSERT INTO public.subjects (name, class_id, annex_id)
          VALUES (subj, cls.id, ann.id)
          ON CONFLICT (name, class_id, annex_id) DO NOTHING;
        END LOOP;

      ELSIF cls.name LIKE 'JSS%' THEN
        FOREACH subj IN ARRAY jss_subjects LOOP
          INSERT INTO public.subjects (name, class_id, annex_id)
          VALUES (subj, cls.id, ann.id)
          ON CONFLICT (name, class_id, annex_id) DO NOTHING;
        END LOOP;

      ELSE
        FOREACH subj IN ARRAY ss_subjects LOOP
          INSERT INTO public.subjects (name, class_id, annex_id)
          VALUES (subj, cls.id, ann.id)
          ON CONFLICT (name, class_id, annex_id) DO NOTHING;
        END LOOP;
      END IF;

    END LOOP;
  END LOOP;
END $$;
