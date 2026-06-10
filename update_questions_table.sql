ALTER TABLE `questions` ADD `topic_id` INT(11) NULL DEFAULT NULL AFTER `subject_id`;
ALTER TABLE `questions` ADD CONSTRAINT `topic_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `chapter_topics` (`id`) ON DELETE SET NULL;
