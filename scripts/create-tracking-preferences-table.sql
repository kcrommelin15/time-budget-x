-- Create tracking preferences table
CREATE TABLE IF NOT EXISTS tracking_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vacation_mode BOOLEAN DEFAULT false,
  weekly_schedule JSONB DEFAULT '{
    "monday": {"enabled": true, "startTime": "09:00", "endTime": "17:00", "hours": 8},
    "tuesday": {"enabled": true, "startTime": "09:00", "endTime": "17:00", "hours": 8},
    "wednesday": {"enabled": true, "startTime": "09:00", "endTime": "17:00", "hours": 8},
    "thursday": {"enabled": true, "startTime": "09:00", "endTime": "17:00", "hours": 8},
    "friday": {"enabled": true, "startTime": "09:00", "endTime": "17:00", "hours": 8},
    "saturday": {"enabled": false, "startTime": "10:00", "endTime": "14:00", "hours": 4},
    "sunday": {"enabled": false, "startTime": "10:00", "endTime": "14:00", "hours": 4}
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Create RLS policies
ALTER TABLE tracking_preferences ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own tracking preferences
CREATE POLICY "Users can view their own tracking preferences" ON tracking_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own tracking preferences
CREATE POLICY "Users can insert their own tracking preferences" ON tracking_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own tracking preferences
CREATE POLICY "Users can update their own tracking preferences" ON tracking_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own tracking preferences
CREATE POLICY "Users can delete their own tracking preferences" ON tracking_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tracking_preferences_updated_at BEFORE UPDATE
    ON tracking_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
