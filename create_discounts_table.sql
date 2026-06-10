CREATE TABLE `cart_discounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `min_cart_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initialize with a default row
INSERT INTO `cart_discounts` (`id`, `is_enabled`, `min_cart_value`, `discount_percentage`) 
VALUES (1, 0, 500.00, 10.00) 
ON DUPLICATE KEY UPDATE id=id;
