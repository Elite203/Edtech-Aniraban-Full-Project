CREATE TABLE `test_series_referrals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `referrer_id` int(11) NOT NULL,
  `referee_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `referrer_purchase_id` int(11) NOT NULL,
  `referee_purchase_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_test_referral` (`referrer_id`, `referee_id`, `course_id`),
  FOREIGN KEY (`referrer_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`referee_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`referrer_purchase_id`) REFERENCES `test_series_purchases` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`referee_purchase_id`) REFERENCES `test_series_purchases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
