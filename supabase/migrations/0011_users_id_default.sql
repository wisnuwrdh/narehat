-- Add default UUID generation for users.id
ALTER TABLE public.users 
ALTER COLUMN id SET DEFAULT uuid_generate_v4();

