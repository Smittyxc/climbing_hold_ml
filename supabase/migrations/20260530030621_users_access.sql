-- 1. Enable RLS (if it isn't already)
alter table public.users enable row level security;

-- 2. Create a policy allowing a user to read ONLY their own row
create policy "Users can view their own profile"
on public.users
for select
to authenticated
using ( auth.uid() = id );