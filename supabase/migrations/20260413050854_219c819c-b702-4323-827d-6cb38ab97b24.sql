CREATE POLICY "Anyone can update events"
ON public.events
FOR UPDATE
USING (true);