ALTER TABLE users
    ADD COLUMN password_reset_token VARCHAR(100) NULL,
    ADD COLUMN password_reset_expires DATETIME(6) NULL;