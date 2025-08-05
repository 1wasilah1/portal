-- Add password column to user_mail table
ALTER TABLE user_mail ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Create index on email for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_user_mail_email ON user_mail(email); 