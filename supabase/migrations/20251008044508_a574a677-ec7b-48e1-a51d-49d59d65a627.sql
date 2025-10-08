-- Create a security definer function to find groups by invite code
-- This bypasses RLS since invite codes are meant to be shared
CREATE OR REPLACE FUNCTION public.find_group_by_invite_code(_invite_code text)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  created_by uuid,
  invite_code text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, description, created_by, invite_code, created_at, updated_at
  FROM public.groups
  WHERE invite_code = _invite_code;
$$;