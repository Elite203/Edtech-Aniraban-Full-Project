-- Add coupon_enabled column to cart_discounts
ALTER TABLE `cart_discounts` ADD COLUMN `coupon_enabled` TINYINT(1) NOT NULL DEFAULT 0;

-- Create coupons table
CREATE TABLE `coupons` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `coupon_code` VARCHAR(50) NOT NULL,
  `discount_percentage` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `is_universal` TINYINT(1) NOT NULL DEFAULT 0,
  `course_ids` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_coupon_code` (`coupon_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
