
-- Custom tabs metadata
CREATE TABLE public.custom_tabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'table',
  visible_in_view boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_tabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read custom_tabs" ON public.custom_tabs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert custom_tabs" ON public.custom_tabs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update custom_tabs" ON public.custom_tabs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete custom_tabs" ON public.custom_tabs FOR DELETE USING (true);

-- Custom tab table data (rows stored as JSONB)
CREATE TABLE public.custom_tab_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id uuid NOT NULL REFERENCES public.custom_tabs(id) ON DELETE CASCADE,
  row_data jsonb NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_tab_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read custom_tab_rows" ON public.custom_tab_rows FOR SELECT USING (true);
CREATE POLICY "Anyone can insert custom_tab_rows" ON public.custom_tab_rows FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update custom_tab_rows" ON public.custom_tab_rows FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete custom_tab_rows" ON public.custom_tab_rows FOR DELETE USING (true);

-- Store column definitions per tab
CREATE TABLE public.custom_tab_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id uuid NOT NULL REFERENCES public.custom_tabs(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE public.custom_tab_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read custom_tab_columns" ON public.custom_tab_columns FOR SELECT USING (true);
CREATE POLICY "Anyone can insert custom_tab_columns" ON public.custom_tab_columns FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update custom_tab_columns" ON public.custom_tab_columns FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete custom_tab_columns" ON public.custom_tab_columns FOR DELETE USING (true);
