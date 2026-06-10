-- Table structure for banner_toggle
-- This table stores the state of the homepage popup banner (enabled/disabled)

CREATE TABLE `banner_toggle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `state` boolean NOT NULL DEFAULT TRUE,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default record with popup enabled
INSERT INTO `banner_toggle` (`state`) VALUES (TRUE);