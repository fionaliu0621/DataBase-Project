DELIMITER $$

CREATE PROCEDURE AddOrder(
    IN p_customer_id VARCHAR(50),
    IN p_product_id VARCHAR(50),
    IN p_seller_id VARCHAR(50),
    IN p_price DECIMAL(10,2),
    IN p_freight_value DECIMAL(10,2),
    IN p_shipping_limit_date TIMESTAMP,
    IN p_payment_type VARCHAR(20),
    IN p_payment_value DECIMAL(10,2),
    IN p_quantity INT
)
BEGIN
    DECLARE new_order_id VARCHAR(50);
    SET new_order_id = UUID();
    
    INSERT INTO Orders (
        order_id, customer_id, order_status, 
        order_purchase_timestamp
    ) VALUES (
        new_order_id, p_customer_id, 'created', NOW()
    );
    
    INSERT INTO Order_Items (
        order_id, order_item_id, product_id, seller_id,
        shipping_limit_date, price, freight_value, quantity
    ) VALUES (
        new_order_id, 1, p_product_id, p_seller_id,
        p_shipping_limit_date, p_price, p_freight_value, p_quantity
    );
    
    INSERT INTO Order_Payments (
        order_id, payment_sequential, payment_type,
        payment_installments, payment_value
    ) VALUES (
        new_order_id, 1, p_payment_type, 1, p_payment_value
    );
    
    SELECT new_order_id AS order_id;
END$$

DELIMITER ;