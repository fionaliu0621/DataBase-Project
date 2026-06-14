CREATE DATABASE IF NOT EXISTS `team11`;
USE `team11`;

-- 1. 建立地理位置表
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Geolocation`;
SET FOREIGN_KEY_CHECKS = 1;
CREATE TABLE IF NOT EXISTS `Geolocation` (
    `geolocation_zip_code_prefix` VARCHAR(10) PRIMARY KEY,
    `geolocation_lat` DECIMAL(10, 8),
    `geolocation_lng` DECIMAL(11, 8),
    `geolocation_city` VARCHAR(50)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERT IGNORE INTO `Geolocation` (`geolocation_zip_code_prefix`, `geolocation_lat`, `geolocation_lng`, `geolocation_city`, `geolocation_state`) VALUES
-- ('100', 25.03300000, 121.56540000, 'Taipei', 'TP'),
-- ('400', 24.14770000, 120.67360000, 'Taichung', 'TC'),
-- ('800', 22.62730000, 120.30140000, 'Kaohsiung', 'KH');



-- 3. 建立買家資料表
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Customers`;
SET FOREIGN_KEY_CHECKS = 1;
CREATE TABLE IF NOT EXISTS `Customers` (
    `customer_id` VARCHAR(50) PRIMARY KEY,
    `customer_unique_id` VARCHAR(50) NOT NULL,
    `customer_zip_code_prefix` VARCHAR(10),
    `customer_city` VARCHAR(50),
    FOREIGN KEY (`customer_zip_code_prefix`) REFERENCES `Geolocation`(`geolocation_zip_code_prefix`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERT IGNORE INTO `Customers` (`customer_id`, `customer_unique_id`, `customer_zip_code_prefix`, `customer_city`, `customer_state`) VALUES
-- ('cust_1', 'uniq_cust_1', '100', 'Taipei', 'TP'),
-- ('cust_2', 'uniq_cust_2', '400', 'Taichung', 'TC'),
-- ('cust_3', 'uniq_cust_3', '800', 'Kaohsiung', 'KH'),
-- ('cust_4', 'uniq_cust_4', '100', 'Taipei', 'TP'),
-- ('cust_5', 'uniq_cust_5', '400', 'Taichung', 'TC');


-- 4. 建立賣家資料表
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Sellers`;
SET FOREIGN_KEY_CHECKS = 1;
CREATE TABLE IF NOT EXISTS `Sellers` (
    `seller_id` VARCHAR(50) PRIMARY KEY,
    `seller_zip_code_prefix` VARCHAR(10),
    `seller_city` VARCHAR(50),
    FOREIGN KEY (`seller_zip_code_prefix`) REFERENCES `Geolocation`(`geolocation_zip_code_prefix`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERT IGNORE INTO `Sellers` (`seller_id`, `seller_zip_code_prefix`, `seller_city`, `seller_state`) VALUES
-- ('sell_1', '400', 'Taichung', 'TC'),
-- ('sell_2', '800', 'Kaohsiung', 'KH'),
-- ('sell_3', '100', 'Taipei', 'TP');


-- 5. 建立商品資料表
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Products`;
SET FOREIGN_KEY_CHECKS = 1;
CREATE TABLE IF NOT EXISTS `Products` (
    `product_id` VARCHAR(50) PRIMARY KEY,
    `product_name` VARCHAR(50),
    `product_category_name` VARCHAR(50),
    `product_name_length` INT,
    `product_description_length` INT,
    `product_photos_qty` INT,
    `product_weight_g` INT,
    `product_length_cm` INT,
    `product_height_cm` INT,
    `product_width_cm` INT,
    `product_available` INT,
    `product_price` INT
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERT IGNORE INTO `Products` (`product_id`, `product_category_name`, `product_name_length`, `product_description_length`, `product_photos_qty`, `product_weight_g`, `product_length_cm`, `product_height_cm`, `product_width_cm`, `product_available`) VALUES
-- ('prod_1', 'home_appliances', 13, 154, 2, 4522, 59, 21, 23, 1),
-- ('prod_2', 'electronics', 11, 142, 5, 2337, 24, 25, 12, 1),
-- ('prod_3', 'books', 23, 76, 5, 4181, 29, 20, 31, 0),
-- ('prod_4', 'home_appliances', 19, 114, 2, 2831, 17, 39, 39, 1),
-- ('prod_5', 'electronics', 25, 161, 4, 1530, 18, 33, 27, 0);


-- 6. 建立訂單主表
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Orders`;
SET FOREIGN_KEY_CHECKS = 1;
CREATE TABLE IF NOT EXISTS `Orders` (
    `order_id` VARCHAR(50) PRIMARY KEY,
    `customer_id` VARCHAR(50) NOT NULL,
    `order_status` VARCHAR(20) CHECK (`order_status` IN ('created', 'approved', 'processing', 'shipped', 'delivered', 'canceled', 'refund')),
    `order_purchase_timestamp` TIMESTAMP NULL,
    `order_approved_at` TIMESTAMP NULL,
    `order_delivered_carrier_date` TIMESTAMP NULL,
    `order_delivered_customer_date` TIMESTAMP NULL,
    `order_estimated_delivery_date` TIMESTAMP NULL,
    `shipping_limit_date` TIMESTAMP NULL,
    FOREIGN KEY (`customer_id`) REFERENCES `Customers`(`customer_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERT IGNORE INTO `Orders` (`order_id`, `customer_id`, `order_status`, `order_purchase_timestamp`, `order_approved_at`, `order_delivered_carrier_date`, `order_delivered_customer_date`, `order_estimated_delivery_date`, `shipping_limit_date`) VALUES
-- ('ord_1', 'cust_1', 'delivered', '2026-06-01 04:00:00', '2026-06-01 04:30:00', '2026-06-02 04:30:00', '2026-06-04 04:30:00', '2026-06-08 04:00:00', '2026-06-04 04:00:00'),
-- ('ord_2', 'cust_3', 'shipped', '2026-06-02 07:00:00', '2026-06-02 07:15:00', '2026-06-03 07:15:00', NULL, '2026-06-09 07:00:00', '2026-06-05 07:00:00'),
-- ('ord_3', 'cust_3', 'delivered', '2026-06-03 01:00:00', '2026-06-03 01:45:00', '2026-06-04 01:45:00', '2026-06-06 01:45:00', '2026-06-10 01:00:00', '2026-06-06 01:00:00'),
-- ('ord_4', 'cust_2', 'processing', '2026-06-04 09:00:00', '2026-06-04 09:20:00', NULL, NULL, '2026-06-11 09:00:00', '2026-06-07 09:00:00'),
-- ('ord_5', 'cust_1', 'canceled', '2026-06-05 03:00:00', '2026-06-05 03:10:00', NULL, NULL, '2026-06-12 03:00:00', '2026-06-08 03:00:00');


-- 7. 建立訂單項目表
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Order_Items`;
SET FOREIGN_KEY_CHECKS = 1;
CREATE TABLE IF NOT EXISTS `Order_Items` (
    `order_id` VARCHAR(50),
    `order_item_id` INT,
    `product_id` VARCHAR(50) NOT NULL,
    `seller_id` VARCHAR(50) NOT NULL,
    `shipping_limit_date` TIMESTAMP NULL,
    `price` DECIMAL(10, 2),          
    `freight_value` DECIMAL(10, 2),  
    `order_item_quantity` INT DEFAULT 1, 
    PRIMARY KEY (`order_id`, `order_item_id`),
    FOREIGN KEY (`order_id`) REFERENCES `Orders`(`order_id`),
    FOREIGN KEY (`product_id`) REFERENCES `Products`(`product_id`),
    FOREIGN KEY (`seller_id`) REFERENCES `Sellers`(`seller_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERT IGNORE INTO `Order_Items` (`order_id`, `order_item_id`, `product_id`, `seller_id`, `shipping_limit_date`, `price`, `freight_value`, `order_item_quantity`) VALUES
-- ('ord_1', 1, 'prod_4', 'sell_2', '2026-06-04 04:00:00', 123.45, 15.20, 1),
-- ('ord_2', 1, 'prod_1', 'sell_1', '2026-06-05 07:00:00', 340.00, 25.00, 1),
-- ('ord_3', 1, 'prod_2', 'sell_3', '2026-06-06 01:00:00', 45.99, 9.50, 2),
-- ('ord_4', 1, 'prod_5', 'sell_1', '2026-06-07 09:00:00', 199.00, 18.80, 1),
-- ('ord_5', 1, 'prod_3', 'sell_2', '2026-06-08 03:00:00', 88.50, 12.00, 1);


-- 8. 建立付款紀錄表
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Order_Payments`;
SET FOREIGN_KEY_CHECKS = 1;
CREATE TABLE IF NOT EXISTS `Order_Payments` (
    `order_id` VARCHAR(50),
    `payment_sequential` INT,
    `payment_type` VARCHAR(20) CHECK (`payment_type` IN ('credit_card', 'cash', 'debit_card', 'transfer')),
    `payment_installments` INT,
    `payment_value` DECIMAL(10, 2),
    PRIMARY KEY (`order_id`, `payment_sequential`),
    FOREIGN KEY (`order_id`) REFERENCES `Orders`(`order_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERT IGNORE INTO `Order_Payments` (`order_id`, `payment_sequential`, `payment_type`, `payment_installments`, `payment_value`) VALUES
-- ('ord_1', 1, 'credit_card', 3, 138.65),
-- ('ord_2', 1, 'transfer', 1, 365.00),
-- ('ord_3', 1, 'debit_card', 1, 101.48),
-- ('ord_4', 1, 'credit_card', 6, 217.80),
-- ('ord_5', 1, 'voucher', 1, 100.50);


-- 9. 建立評價紀錄表
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Order_Reviews`;
SET FOREIGN_KEY_CHECKS = 1;
CREATE TABLE IF NOT EXISTS `Order_Reviews` (
    `review_id` VARCHAR(50) PRIMARY KEY,
    `order_id` VARCHAR(50) UNIQUE NOT NULL,
    `review_score` INT CHECK (`review_score` BETWEEN 1 AND 5),
    `review_comment_title` VARCHAR(255),
    `review_comment_message` TEXT,
    `review_creation_date` TIMESTAMP NULL,
    `review_answer_timestamp` TIMESTAMP NULL,
    FOREIGN KEY (`order_id`) REFERENCES `Orders`(`order_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERT IGNORE INTO `Order_Reviews` (`review_id`, `order_id`, `review_score`, `review_comment_title`, `review_comment_message`, `review_creation_date`, `review_answer_timestamp`) VALUES
-- ('rev_1', 'ord_1', 5, 'Great Service', 'Comment message for order ord_1.', '2026-06-05 04:30:00', '2026-06-05 09:30:00'),
-- ('rev_5', 'ord_5', 1, 'Canceled Order', 'Comment message for order ord_5.', '2026-06-09 03:00:00', '2026-06-09 08:00:00');