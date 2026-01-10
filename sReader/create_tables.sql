-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    UNIQUE(from_user_id, to_user_id)
);

-- Create indexes for friendships
CREATE INDEX IF NOT EXISTS friendships_from_user_id_idx ON public.friendships(from_user_id);
CREATE INDEX IF NOT EXISTS friendships_to_user_id_idx ON public.friendships(to_user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create index for notifications
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
