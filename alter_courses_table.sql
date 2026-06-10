-- ALTER command to change image column from VARCHAR to BLOB
-- Run this command in your MySQL database to change the column type

ALTER TABLE `courses` MODIFY COLUMN `image` LONGBLOB;

-- Optional: Add comment to the column
ALTER TABLE `courses` MODIFY COLUMN `image` LONGBLOB COMMENT 'Course image stored as binary data';