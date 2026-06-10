-- Add set_name column to exam_sets table
ALTER TABLE `exam_sets` ADD `set_name` VARCHAR(255) NOT NULL DEFAULT 'Set' AFTER `set_number`;

-- Update existing records
UPDATE `exam_sets` SET `set_name` = CONCAT('Set ', `set_number`) WHERE `set_name` = 'Set';