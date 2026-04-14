ALTER TABLE public.events
  ADD COLUMN event_kind text DEFAULT 'חד פעמי',
  ADD COLUMN linked_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  ADD COLUMN end_date text,
  ADD COLUMN planned_soldiers integer,
  ADD COLUMN actual_soldiers integer,
  ADD COLUMN placement_targets text,
  ADD COLUMN notes text;