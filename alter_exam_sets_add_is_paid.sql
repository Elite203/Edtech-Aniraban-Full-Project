-- Add is_paid column to exam_sets table
ALTER TABLE `exam_sets` ADD `is_paid` TINYINT(1) NOT NULL DEFAULT 0 AFTER `set_name`;