-- Add is_completed column to user_books
ALTER TABLE user_books ADD COLUMN is_completed BOOLEAN DEFAULT FALSE;
