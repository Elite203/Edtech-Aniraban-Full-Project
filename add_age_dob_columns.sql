-- Add age and date_of_birth columns to students table

-- Add age column (integer type, nullable)
ALTER TABLE `students` 
ADD COLUMN `age` INT(3) NULL DEFAULT NULL AFTER `number`;

-- Add date_of_birth column (date type, nullable)
ALTER TABLE `students` 
ADD COLUMN `date_of_birth` DATE NULL DEFAULT NULL AFTER `age`;

-- Optional: Add index on date_of_birth for better query performance
ALTER TABLE `students` 
ADD KEY `idx_date_of_birth` (`date_of_birth`);

-- Verify the table structure
DESCRIBE `students`;