DELIMITER $$

CREATE TRIGGER trg_order_status_log
AFTER UPDATE ON Orders
FOR EACH ROW
BEGIN
    IF OLD.order_status <> NEW.order_status THEN
        INSERT INTO Order_Status_Log (
            order_id, old_status, new_status
        ) VALUES (
            NEW.order_id, OLD.order_status, NEW.order_status
        );
    END IF;
END$$

DELIMITER ;