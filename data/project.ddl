-- 1. 建立地理位置表 (Base Table)
CREATE TABLE Geolocation (
    geolocation_zip_code_prefix VARCHAR(10) PRIMARY KEY,
    geolocation_lat DECIMAL(10, 8),
    geolocation_lng DECIMAL(11, 8),
    geolocation_city VARCHAR(50),
    geolocation_state VARCHAR(2)
);

-- 3. 建立買家資料表
CREATE TABLE Customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_unique_id VARCHAR(50) NOT NULL,
    customer_zip_code_prefix VARCHAR(10),
    customer_city VARCHAR(50),
    customer_state VARCHAR(2),
    FOREIGN KEY (customer_zip_code_prefix) REFERENCES Geolocation(geolocation_zip_code_prefix)
);

-- 4. 建立賣家資料表
CREATE TABLE Sellers (
    seller_id VARCHAR(50) PRIMARY KEY,
    seller_zip_code_prefix VARCHAR(10),
    seller_city VARCHAR(50),
    seller_state VARCHAR(2),
    FOREIGN KEY (seller_zip_code_prefix) REFERENCES Geolocation(geolocation_zip_code_prefix)
);

-- 5. 建立商品資料表
-- product_category_name 對齊前端 7 大分類 (frontend/src/pages/HomePage.jsx 的 CATS)：
--   electronics <-> Electronics
--   fashion     <-> Fashion
--   home_living <-> Home & Living
--   sports      <-> Sports
--   books       <-> Books
--   beauty      <-> Beauty
--   toys        <-> Toys
-- 原本參照不存在的 Product_Category_Name_Translation 表的 FK 已移除，
-- 改用 CHECK 約束直接限制合法的分類 slug，避免商品分類打錯字。
CREATE TABLE Products (
    product_id VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    product_category_name VARCHAR(50) CHECK (product_category_name IN ('electronics', 'fashion', 'home_living', 'sports', 'books', 'beauty', 'toys')),
    product_name_length INT,
    product_description_length INT,
    product_photos_qty INT,
    product_weight_g INT,
    product_length_cm INT,
    product_height_cm INT,
    product_width_cm INT,
    product_available INT,
    product_price DECIMAL(10, 2)
);

-- 6. 建立訂單主表 (已補齊 shipping_limit_date)
CREATE TABLE Orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    order_status VARCHAR(20) CHECK (order_status IN ('created', 'approved', 'processing', 'shipped', 'delivered', 'canceled', 'refund')),
    order_purchase_timestamp TIMESTAMP,
    order_approved_at TIMESTAMP,
    order_delivered_carrier_date TIMESTAMP,
    order_delivered_customer_date TIMESTAMP,
    order_estimated_delivery_date TIMESTAMP,
    shipping_limit_date TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);

-- 7. 建立訂單項目表
CREATE TABLE Order_Items (
    order_id VARCHAR(50),
    order_item_id INT,
    product_id VARCHAR(50) NOT NULL,
    seller_id VARCHAR(50) NOT NULL,
    shipping_limit_date TIMESTAMP,
    price DECIMAL(10, 2),         
    freight_value DECIMAL(10, 2),  
    order_item_quantity INT DEFAULT 1, 
    PRIMARY KEY (order_id, order_item_id),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    FOREIGN KEY (seller_id) REFERENCES Sellers(seller_id)
);

-- 8. 建立付款紀錄表
CREATE TABLE Order_Payments (
    order_id VARCHAR(50),
    payment_sequential INT,
    payment_type VARCHAR(20) CHECK (payment_type IN ('credit_card', 'voucher', 'debit_card', 'transfer')),
    payment_installments INT,
    payment_value DECIMAL(10, 2),
    PRIMARY KEY (order_id, payment_sequential),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);

-- 9. 建立評價紀錄表
CREATE TABLE Order_Reviews (
    review_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    review_score INT CHECK (review_score BETWEEN 1 AND 5),
    review_comment_title VARCHAR(255),
    review_comment_message TEXT,
    review_creation_date TIMESTAMP,
    review_answer_timestamp TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);
