-- Add photo column to students table
ALTER TABLE `students` ADD COLUMN `photo` MEDIUMBLOB NULL DEFAULT NULL AFTER `number`;

-- Update the table comment to reflect the new column
ALTER TABLE `students` COMMENT = 'Students table with profile photo support (MEDIUMBLOB format)';

-- Create index for checking photo existence (BLOB indexing limited)
CREATE INDEX `idx_has_photo` ON `students` ((CASE WHEN `photo` IS NOT NULL THEN 1 ELSE 0 END));