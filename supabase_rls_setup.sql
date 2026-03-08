-- Enable RLS on requests
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to perform all operations on requests
CREATE POLICY "Enable all operations for authenticated users on requests"
ON public.requests
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Enable RLS on saved_boardings
ALTER TABLE public.saved_boardings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to perform all operations on saved_boardings
CREATE POLICY "Enable all operations for authenticated users on saved_boardings"
ON public.saved_boardings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
