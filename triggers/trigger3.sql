DELIMITER $$

CREATE TRIGGER trg_payment_check
AFTER INSERT ON Order_Payments
FOR EACH ROW
BEGIN
    DECLARE total_paid DECIMAL(10,2);
    DECLARE total_due DECIMAL(10,2);
    
    SELECT SUM(payment_value) INTO total_paid
    FROM Order_Payments
    WHERE order_id = NEW.order_id;
    
    SELECT SUM(price * quantity + freight_value) INTO total_due
    FROM Order_Items
    WHERE order_id = NEW.order_id;
    
    IF total_paid > total_due THEN
        INSERT INTO Order_Status_Log (
            order_id, old_status, new_status
        ) VALUES (
            NEW.order_id, 'payment_warning',
            CONCAT('overpaid: ', total_paid, ' > ', total_due)
        );
    END IF;
END$$

DELIMITER ;