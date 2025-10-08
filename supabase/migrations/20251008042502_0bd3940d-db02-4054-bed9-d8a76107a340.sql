-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view groups they're members of" ON public.groups;

-- Create a new SELECT policy that allows users to see:
-- 1. Groups they created
-- 2. Groups they're members of
CREATE POLICY "Users can view their groups"
ON public.groups
FOR SELECT
USING (
  auth.uid() = created_by 
  OR 
  public.is_group_member(auth.uid(), id)
);