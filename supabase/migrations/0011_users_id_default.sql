-- Add default UUID generation for users.id
ALTER TABLE public.users 
ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Add email_verified column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
