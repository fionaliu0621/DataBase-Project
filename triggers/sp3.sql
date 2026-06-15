USE railway;

SET SQL_SAFE_UPDATES = 0;

DELIMITER $$

CREATE PROCEDURE UpdateOrderStatus(
    IN p_order_id VARCHAR(50),
    IN p_new_status VARCHAR(20)
)
BEGIN
    DECLARE current_status VARCHAR(20);
    DECLARE is_valid BOOLEAN DEFAULT FALSE;
    
    SELECT order_status INTO current_status
    FROM Orders WHERE order_id COLLATE utf8mb4_unicode_ci = p_order_id COLLATE utf8mb4_unicode_ci;
    
    IF current_status = 'created' AND p_new_status = 'approved' THEN
        SET is_valid = TRUE;
    ELSEIF current_status = 'approved' AND p_new_status = 'processing' THEN
        SET is_valid = TRUE;
    ELSEIF current_status = 'processing' AND p_new_status = 'shipped' THEN
        SET is_valid = TRUE;
    ELSEIF current_status = 'shipped' AND p_new_status = 'delivered' THEN
        SET is_valid = TRUE;
    ELSEIF p_new_status = 'canceled' 
        AND current_status NOT IN ('delivered', 'canceled', 'refund') THEN
        SET is_valid = TRUE;
    END IF;
    
    IF is_valid THEN
        UPDATE Orders 
        SET order_status = p_new_status 
        WHERE order_id COLLATE utf8mb4_unicode_ci = p_order_id COLLATE utf8mb4_unicode_ci;
        SELECT 'success' AS result;
    ELSE
        SELECT CONCAT('invalid transition: ', 
               current_status, ' -> ', p_new_status) AS result;
    END IF;
END$$

DELIMITER ;
