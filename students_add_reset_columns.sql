-- Add reset token and expiry columns to students table
ALTER TABLE `students` 
ADD COLUMN `reset_token` VARCHAR(255) NULL DEFAULT NULL,
ADD COLUMN `reset_expires` TIMESTAMP NULL DEFAULT NULL;