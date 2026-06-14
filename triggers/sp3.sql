DELIMITER $$

CREATE PROCEDURE UpdateOrderStatus(
    IN p_order_id VARCHAR(50),
    IN p_new_status VARCHAR(20)
)
BEGIN
    DECLARE current_status VARCHAR(20);
    DECLARE is_valid BOOLEAN DEFAULT FALSE;
    
    SELECT order_status INTO current_status
    FROM Orders WHERE order_id = p_order_id;
    
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
        WHERE order_id = p_order_id;
        SELECT 'success' AS result;
    ELSE
        SELECT CONCAT('invalid transition: ', 
               current_status, ' → ', p_new_status) AS result;
    END IF;
END$$

DELIMITER ;