-- ==============================================================================
-- GlamAI Supabase Database Schema (PostgreSQL)
-- Run this script in your Supabase Project Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT DEFAULT '',
    password_hash TEXT NOT NULL,
    avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    notifications JSONB DEFAULT '{"recommendations": true, "seasonal_tips": true, "new_shades": false}'::jsonb,
    theme TEXT DEFAULT 'Blush',
    beauty_profile JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Saved Looks Table
CREATE TABLE IF NOT EXISTS public.saved_looks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event TEXT DEFAULT 'Custom',
    time_of_day TEXT DEFAULT 'Day',
    date TEXT DEFAULT '',
    thumbnail TEXT,
    original_image TEXT,
    shades JSONB DEFAULT '{}'::jsonb,
    analysis JSONB DEFAULT '{}'::jsonb,
    palette_name TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Fast Query Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_saved_looks_user_id ON public.saved_looks(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_looks_created_at ON public.saved_looks(created_at DESC);

-- 4. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_looks ENABLE ROW LEVEL SECURITY;

-- Allow full access for backend service and API key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow public and service access'
    ) THEN
        CREATE POLICY "Allow public and service access" ON public.users FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'saved_looks' AND policyname = 'Allow public and service access'
    ) THEN
        CREATE POLICY "Allow public and service access" ON public.saved_looks FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
