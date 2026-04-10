
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('מכינה', 'גיוס', 'חופשה', 'תפילה', 'אימון', 'כללי')),
  description TEXT,
  time TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  due_date TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('דחוף', 'בינוני', 'רגיל')),
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.soldiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('פעיל', 'חופשה', 'מילואים')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soldiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Anyone can read tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Anyone can read soldiers" ON public.soldiers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete events" ON public.events FOR DELETE USING (true);
CREATE POLICY "Anyone can insert tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete tasks" ON public.tasks FOR DELETE USING (true);
CREATE POLICY "Anyone can insert soldiers" ON public.soldiers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete soldiers" ON public.soldiers FOR DELETE USING (true);

INSERT INTO public.events (title, date, type, time) VALUES
  ('מועד פתיחה 2 מכינות במעלות צור', '2026-04-22', 'מכינה', NULL),
  ('תפילת שחרית משותפת', '2026-04-15', 'תפילה', '06:30'),
  ('אימון כושר קרבי', '2026-04-18', 'אימון', '08:00'),
  ('גיוס מחזור אפריל', '2026-04-28', 'גיוס', NULL),
  ('חופשת פסח', '2026-04-12', 'חופשה', NULL),
  ('הרצאה בנושא ביטחון', '2026-04-20', 'כללי', '14:00');

INSERT INTO public.tasks (title, due_date, priority, completed) VALUES
  ('לדבר עם לי״ן ושואן', '2026-04-12', 'בינוני', false),
  ('לעדכן רשימת חיילים', '2026-04-14', 'דחוף', false),
  ('להכין לוח זמנים לשבוע הבא', '2026-04-13', 'רגיל', false),
  ('לאשר חופשות פסח', '2026-04-11', 'דחוף', true);

INSERT INTO public.soldiers (name, unit, status, phone) VALUES
  ('יוסף כהן', 'פלוגה א׳', 'פעיל', '050-1234567'),
  ('דוד לוי', 'פלוגה א׳', 'פעיל', '050-2345678'),
  ('משה ישראלי', 'פלוגה ב׳', 'חופשה', '050-3456789'),
  ('אברהם פרידמן', 'פלוגה ב׳', 'פעיל', '050-4567890'),
  ('יעקב גולדשטיין', 'פלוגה א׳', 'מילואים', '050-5678901');
