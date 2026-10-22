-- Add verification columns to users table
ALTER TABLE users
    ADD COLUMN verification_code VARCHAR(10) NULL;

ALTER TABLE users
    ADD COLUMN code_expires DATETIME(6) NULL;

-- Create index on phone
CREATE INDEX idx_users_phone ON users(phone);