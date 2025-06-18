-- Create a secure function to check if an email exists
-- This function runs with elevated privileges to access auth.users
CREATE OR REPLACE FUNCTION public.check_user_exists_by_email(email_address text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to access auth schema
SET search_path = public, auth
AS $$
BEGIN
  -- Check if user exists in auth.users table
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = lower(trim(email_address))
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return false if any error occurs
    RETURN false;
END;
$$;

-- Grant execute permissions to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.check_user_exists_by_email(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_user_exists_by_email(text) TO authenticated;

-- Add a comment for documentation
COMMENT ON FUNCTION public.check_user_exists_by_email(text) IS 'Safely checks if a user exists in auth.users by email address';
