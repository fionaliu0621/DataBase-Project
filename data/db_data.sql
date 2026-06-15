CREATE DATABASE IF NOT EXISTS `team11`;
USE `team11`;

-- 1. 建立地理位置表
CREATE TABLE IF NOT EXISTS `Geolocation` (
    `geolocation_zip_code_prefix` VARCHAR(10) PRIMARY KEY,
    `geolocation_lat` DECIMAL(10, 8),
    `geolocation_lng` DECIMAL(11, 8),
    `geolocation_city` VARCHAR(50),
    `geolocation_state` VARCHAR(2)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `Geolocation` (`geolocation_zip_code_prefix`, `geolocation_lat`, `geolocation_lng`, `geolocation_city`, `geolocation_state`) VALUES
('100', 25.03300000, 121.56540000, 'Taipei', 'TP'),
('400', 24.14770000, 120.67360000, 'Taichung', 'TC'),
('800', 22.62730000, 120.30140000, 'Kaohsiung', 'KH');



-- 3. 建立買家資料表
CREATE TABLE IF NOT EXISTS `Customers` (
    `customer_id` VARCHAR(50) PRIMARY KEY,
    `customer_unique_id` VARCHAR(50) NOT NULL,
    `customer_zip_code_prefix` VARCHAR(10),
    `customer_city` VARCHAR(50),
    `customer_state` VARCHAR(2),
    FOREIGN KEY (`customer_zip_code_prefix`) REFERENCES `Geolocation`(`geolocation_zip_code_prefix`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `Customers` (`customer_id`, `customer_unique_id`, `customer_zip_code_prefix`, `customer_city`, `customer_state`) VALUES
('cust_1', 'uniq_cust_1', '100', 'Taipei', 'TP'),
('cust_2', 'uniq_cust_2', '400', 'Taichung', 'TC'),
('cust_3', 'uniq_cust_3', '800', 'Kaohsiung', 'KH'),
('cust_4', 'uniq_cust_4', '100', 'Taipei', 'TP'),
('cust_5', 'uniq_cust_5', '400', 'Taichung', 'TC');


-- 4. 建立賣家資料表
CREATE TABLE IF NOT EXISTS `Sellers` (
    `seller_id` VARCHAR(50) PRIMARY KEY,
    `seller_zip_code_prefix` VARCHAR(10),
    `seller_city` VARCHAR(50),
    `seller_state` VARCHAR(2),
    FOREIGN KEY (`seller_zip_code_prefix`) REFERENCES `Geolocation`(`geolocation_zip_code_prefix`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `Sellers` (`seller_id`, `seller_zip_code_prefix`, `seller_city`, `seller_state`) VALUES
('sell_1', '400', 'Taichung', 'TC'),
('sell_2', '800', 'Kaohsiung', 'KH'),
('sell_3', '100', 'Taipei', 'TP');


-- 5. 建立商品資料表
-- product_category_name 對齊前端 7 大分類 (frontend/src/pages/HomePage.jsx 的 CATS)：
--   electronics <-> Electronics
--   fashion     <-> Fashion
--   home_living <-> Home & Living
--   sports      <-> Sports
--   books       <-> Books
--   beauty      <-> Beauty
--   toys        <-> Toys
CREATE TABLE IF NOT EXISTS `Products` (
    `product_id` VARCHAR(50) PRIMARY KEY,
    `product_name` VARCHAR(100) NOT NULL,
    `product_category_name` VARCHAR(50) CHECK (`product_category_name` IN ('electronics', 'fashion', 'home_living', 'sports', 'books', 'beauty', 'toys')),
    `product_name_length` INT,
    `product_description_length` INT,
    `product_photos_qty` INT,
    `product_weight_g` INT,
    `product_length_cm` INT,
    `product_height_cm` INT,
    `product_width_cm` INT,
    `product_available` INT,
    `product_price` DECIMAL(10, 2)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30 筆商品，每個分類 4~5 筆。
-- 使用 ON DUPLICATE KEY UPDATE：若 prod_1~prod_5 已存在（被 Order_Items 等表參照），
-- 會直接更新內容而不會刪除重建，不會違反外鍵限制；可重複執行 (idempotent)。
INSERT INTO `Products`
  (`product_id`, `product_name`, `product_category_name`, `product_name_length`,
   `product_description_length`, `product_photos_qty`, `product_weight_g`,
   `product_length_cm`, `product_height_cm`, `product_width_cm`,
   `product_available`, `product_price`)
VALUES
-- Electronics (5)
('prod_1',  'Bluetooth Speaker',           'electronics', 17, 120, 4,   450, 20,  8,  8, 1, 1290.00),
('prod_2',  'Wireless Earbuds',            'electronics', 16, 140, 5,    60,  6,  3,  6, 1, 1990.00),
('prod_3',  'Smart Watch',                 'electronics', 11, 160, 4,    45,  4,  1,  4, 1, 3990.00),
('prod_4',  'Mechanical Keyboard',         'electronics', 19, 130, 3,   950, 44,  4, 14, 1, 2890.00),
('prod_5',  'Portable Power Bank',         'electronics', 19,  95, 3,   250, 14,  2,  7, 0,  890.00),

-- Fashion (4)
('prod_6',  'Canvas Tote Bag',             'fashion',     15, 110, 4,   300, 40, 35, 12, 1,  390.00),
('prod_7',  'Denim Jacket',                'fashion',     12, 150, 5,   600, 70, 60,  5, 1, 1690.00),
('prod_8',  'Leather Wallet',              'fashion',     14, 105, 3,   120, 11,  9,  2, 1,  990.00),
('prod_9',  'Running Sneakers',            'fashion',     16, 145, 5,   700, 30, 12, 11, 1, 2290.00),

-- Home & Living (4)
('prod_10', 'Ceramic Mug Set',             'home_living', 15, 100, 4,  1200, 25, 12, 18, 1,  450.00),
('prod_11', 'LED Desk Lamp',               'home_living', 13,  90, 3,   800, 20, 45, 15, 1,  760.00),
('prod_12', 'Bamboo Cutting Board',        'home_living', 20, 125, 2,   650, 35,  2, 25, 1,  380.00),
('prod_13', 'Cotton Bed Sheet Set',        'home_living', 20, 160, 4,  1500, 40, 30, 10, 0, 1590.00),

-- Sports (4)
('prod_14', 'Yoga Mat',                    'sports',       8,  80, 3,   900, 60,  6, 15, 1,  680.00),
('prod_15', 'Resistance Bands Set',        'sports',      20, 115, 3,   400, 25,  5, 20, 1,  590.00),
('prod_16', 'Jump Rope',                   'sports',       9,  70, 2,   150, 25,  3,  3, 1,  290.00),
('prod_17', 'Adjustable Dumbbell Set',     'sports',      23, 175, 4, 12000, 40, 20, 20, 1, 2490.00),

-- Books (4)
('prod_18', 'Novel: The Shore',            'books',       16,  90, 1,   350, 21, 14,  2, 1,  280.00),
('prod_19', 'Modern Cookbook',             'books',       15, 110, 3,   700, 24, 18,  3, 1,  450.00),
('prod_20', 'Practical Python Guide',      'books',       22, 180, 2,   600, 23, 17,  3, 1,  620.00),
('prod_21', 'Children''s Picture Book Set','books',       27, 200, 5,   900, 25, 20,  5, 1,  990.00),

-- Beauty (4)
('prod_22', 'Sunscreen SPF50',             'beauty',      15,  85, 2,    80,  4, 12,  4, 1,  320.00),
('prod_23', 'Facial Cleanser',             'beauty',      15,  95, 3,   150,  5, 15,  5, 1,  280.00),
('prod_24', 'Makeup Brush Set',            'beauty',      16, 120, 4,   200, 18,  4, 10, 1,  690.00),
('prod_25', 'Moisturizing Hand Cream',     'beauty',      23, 100, 2,   100,  4, 10,  4, 0,  350.00),

-- Toys (5)
('prod_26', 'Building Blocks Set',         'toys',        19, 150, 5,  1800, 40, 30, 10, 1,  990.00),
('prod_27', 'Remote Control Car',          'toys',        18, 135, 4,  1200, 35, 15, 18, 1, 1290.00),
('prod_28', 'Plush Bear',                  'toys',        10,  75, 3,   400, 30, 40, 20, 1,  450.00),
('prod_29', 'Wooden Puzzle Set',           'toys',        17, 110, 3,   600, 25,  5, 25, 1,  380.00),
('prod_30', 'Educational Robot Kit',       'toys',        21, 160, 5,  1500, 35, 25, 15, 1, 1990.00)

ON DUPLICATE KEY UPDATE
  product_name               = VALUES(product_name),
  product_category_name      = VALUES(product_category_name),
  product_name_length        = VALUES(product_name_length),
  product_description_length = VALUES(product_description_length),
  product_photos_qty         = VALUES(product_photos_qty),
  product_weight_g           = VALUES(product_weight_g),
  product_length_cm          = VALUES(product_length_cm),
  product_height_cm          = VALUES(product_height_cm),
  product_width_cm           = VALUES(product_width_cm),
  product_available          = VALUES(product_available),
  product_price              = VALUES(product_price);


-- 6. 建立訂單主表
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

INSERT IGNORE INTO `Orders` (`order_id`, `customer_id`, `order_status`, `order_purchase_timestamp`, `order_approved_at`, `order_delivered_carrier_date`, `order_delivered_customer_date`, `order_estimated_delivery_date`, `shipping_limit_date`) VALUES
('ord_1', 'cust_1', 'delivered', '2026-06-01 04:00:00', '2026-06-01 04:30:00', '2026-06-02 04:30:00', '2026-06-04 04:30:00', '2026-06-08 04:00:00', '2026-06-04 04:00:00'),
('ord_2', 'cust_3', 'shipped', '2026-06-02 07:00:00', '2026-06-02 07:15:00', '2026-06-03 07:15:00', NULL, '2026-06-09 07:00:00', '2026-06-05 07:00:00'),
('ord_3', 'cust_3', 'delivered', '2026-06-03 01:00:00', '2026-06-03 01:45:00', '2026-06-04 01:45:00', '2026-06-06 01:45:00', '2026-06-10 01:00:00', '2026-06-06 01:00:00'),
('ord_4', 'cust_2', 'processing', '2026-06-04 09:00:00', '2026-06-04 09:20:00', NULL, NULL, '2026-06-11 09:00:00', '2026-06-07 09:00:00'),
('ord_5', 'cust_1', 'canceled', '2026-06-05 03:00:00', '2026-06-05 03:10:00', NULL, NULL, '2026-06-12 03:00:00', '2026-06-08 03:00:00');


-- 7. 建立訂單項目表
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

INSERT IGNORE INTO `Order_Items` (`order_id`, `order_item_id`, `product_id`, `seller_id`, `shipping_limit_date`, `price`, `freight_value`, `order_item_quantity`) VALUES
('ord_1', 1, 'prod_4', 'sell_2', '2026-06-04 04:00:00', 123.45, 15.20, 1),
('ord_2', 1, 'prod_1', 'sell_1', '2026-06-05 07:00:00', 340.00, 25.00, 1),
('ord_3', 1, 'prod_2', 'sell_3', '2026-06-06 01:00:00', 45.99, 9.50, 2),
('ord_4', 1, 'prod_5', 'sell_1', '2026-06-07 09:00:00', 199.00, 18.80, 1),
('ord_5', 1, 'prod_3', 'sell_2', '2026-06-08 03:00:00', 88.50, 12.00, 1);


-- 8. 建立付款紀錄表
CREATE TABLE IF NOT EXISTS `Order_Payments` (
    `order_id` VARCHAR(50),
    `payment_sequential` INT,
    `payment_type` VARCHAR(20) CHECK (`payment_type` IN ('credit_card', 'voucher', 'debit_card', 'transfer')),
    `payment_installments` INT,
    `payment_value` DECIMAL(10, 2),
    PRIMARY KEY (`order_id`, `payment_sequential`),
    FOREIGN KEY (`order_id`) REFERENCES `Orders`(`order_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `Order_Payments` (`order_id`, `payment_sequential`, `payment_type`, `payment_installments`, `payment_value`) VALUES
('ord_1', 1, 'credit_card', 3, 138.65),
('ord_2', 1, 'transfer', 1, 365.00),
('ord_3', 1, 'debit_card', 1, 101.48),
('ord_4', 1, 'credit_card', 6, 217.80),
('ord_5', 1, 'voucher', 1, 100.50);


-- 9. 建立評價紀錄表
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

INSERT IGNORE INTO `Order_Reviews` (`review_id`, `order_id`, `review_score`, `review_comment_title`, `review_comment_message`, `review_creation_date`, `review_answer_timestamp`) VALUES
('rev_1', 'ord_1', 5, 'Great Service', 'Comment message for order ord_1.', '2026-06-05 04:30:00', '2026-06-05 09:30:00'),
('rev_5', 'ord_5', 1, 'Canceled Order', 'Comment message for order ord_5.', '2026-06-09 03:00:00', '2026-06-09 08:00:00');
