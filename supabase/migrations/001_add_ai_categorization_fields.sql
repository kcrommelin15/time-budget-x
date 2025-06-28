-- Add fields to support n8n AI categorization
-- Add confidence_score to time_entries for AI categorization confidence
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2);

-- Add ai_categorized flag to track which entries were AI categorized
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS ai_categorized BOOLEAN DEFAULT FALSE;

-- Add activity_description for the raw user input before categorization
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS activity_description TEXT;

-- Ensure categories table has all required fields for n8n workflow
-- The categories table should already have: id, user_id, name, created_at
-- Add sub_categories array field if it doesn't exist (for n8n compatibility)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sub_categories TEXT[];

-- Index for performance on AI categorized entries
CREATE INDEX IF NOT EXISTS idx_time_entries_ai_categorized ON time_entries(ai_categorized);
CREATE INDEX IF NOT EXISTS idx_time_entries_confidence ON time_entries(confidence_score);