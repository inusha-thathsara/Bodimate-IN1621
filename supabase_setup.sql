-- Create requests table
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    boarding_id UUID NOT NULL REFERENCES public.boardings(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create saved_boardings table
CREATE TABLE IF NOT EXISTS public.saved_boardings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    boarding_id UUID NOT NULL REFERENCES public.boardings(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(boarding_id, student_id)
);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
