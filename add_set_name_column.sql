-- Add set_name column to exam_sets table if it doesn't exist
ALTER TABLE exam_sets ADD COLUMN set_name VARCHAR(255) NOT NULL DEFAULT '' AFTER set_number;