CREATE DEFINER=`root`@`%` PROCEDURE `UpdateOrderStatus`(
    IN p_order_id VARCHAR(50),
    IN p_new_status VARCHAR(20)
)
BEGIN
    DECLARE current_status VARCHAR(20);
    
    SET SQL_SAFE_UPDATES = 0;
    
    SELECT order_status INTO current_status
    FROM Orders
    WHERE order_id COLLATE utf8mb4_unicode_ci = p_order_id COLLATE utf8mb4_unicode_ci;
    
    IF (current_status = 'processing' AND p_new_status IN ('approved', 'canceled'))
        OR (current_status = 'approved' AND p_new_status IN ('shipped', 'canceled'))
        OR (current_status = 'shipped' AND p_new_status = 'delivered')
    THEN
        UPDATE Orders SET order_status = p_new_status 
        WHERE order_id COLLATE utf8mb4_unicode_ci = p_order_id COLLATE utf8mb4_unicode_ci;
        SELECT 'success' AS result;
    ELSE
        SELECT CONCAT('invalid transition: ', current_status, ' -> ', p_new_status) AS result;
    END IF;
    
    SET SQL_SAFE_UPDATES = 1;
END
