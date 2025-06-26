-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own profile" ON "public"."profiles";

-- Create new policy
CREATE POLICY "Users can read their own profile"
ON "public"."profiles"
FOR SELECT
TO authenticated
USING (auth.uid() = id);