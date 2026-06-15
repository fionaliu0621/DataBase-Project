CREATE DATABASE IF NOT EXISTS `railway`;
USE `railway`;

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



-- 5. 建立商品資料表
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Products`;
SET FOREIGN_KEY_CHECKS = 1;
CREATE TABLE IF NOT EXISTS `Products` (
    `product_id` VARCHAR(50) PRIMARY KEY,
    `product_seller_id` VARCHAR(50),
    `product_name` VARCHAR(50),
    `product_category_name` VARCHAR(50),
    `product_picture_id` VARCHAR(50),
    `product_name_length` INT,
    `product_description_length` INT,
    `product_photos_qty` INT,
    `product_weight_g` INT,
    `product_length_cm` INT,
    `product_height_cm` INT,
    `product_width_cm` INT,
    `product_available` INT,
    `product_price` INT,
    FOREIGN KEY (`product_seller_id`) REFERENCES `Sellers`(`seller_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



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
