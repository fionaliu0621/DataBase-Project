CREATE DEFINER=`root`@`%` PROCEDURE `AddOrder`(
    IN p_customer_id VARCHAR(50),
    IN p_product_id VARCHAR(50),
    IN p_seller_id VARCHAR(50),
    IN p_price DECIMAL(10,2),
    IN p_freight_value DECIMAL(10,2),
    IN p_shipping_limit_date TIMESTAMP,
    IN p_payment_type VARCHAR(50),
    IN p_payment_value DECIMAL(10,2),
    IN p_quantity INT
)
BEGIN
    DECLARE new_order_id VARCHAR(50);
    SET new_order_id = UUID();
    INSERT INTO Orders(order_id, customer_id, order_status, order_purchase_timestamp, order_estimated_delivery_date, shipping_limit_date)
    VALUES (new_order_id, p_customer_id, 'created', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), p_shipping_limit_date);
    INSERT INTO Order_Items(order_id, product_id, seller_id, price, freight_value, shipping_limit_date, order_item_quantity)
    VALUES (new_order_id, p_product_id, p_seller_id, p_price, p_freight_value, p_shipping_limit_date, p_quantity);
    INSERT INTO Order_Payments(order_id, payment_type, payment_value)
    VALUES (new_order_id, p_payment_type, p_payment_value);
    SELECT new_order_id AS order_id;
END
