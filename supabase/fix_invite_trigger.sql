-- Fix handle_new_user trigger to read role and organization_id from user metadata.
-- This ensures invited users get role='saljare' set at creation time, not 'admin'.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, organization_id, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    CASE
      WHEN NEW.raw_user_meta_data->>'organization_id' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'organization_id')::uuid
      ELSE NULL
    END,
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix Anders' profile role manually (change email if needed)
-- UPDATE profiles SET role = 'saljare' WHERE id = (SELECT id FROM auth.users WHERE email = 'anders.westlund@wtsmachinery.se');
