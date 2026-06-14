DELIMITER $$

CREATE TRIGGER trg_review_check
BEFORE INSERT ON Order_Reviews
FOR EACH ROW
BEGIN
    DECLARE current_status VARCHAR(20);
    
    SELECT order_status INTO current_status
    FROM Orders
    WHERE order_id = NEW.order_id;
    
    IF current_status <> 'delivered' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '只有已送達的訂單才能建立評價';
    END IF;
END$$

DELIMITER ;