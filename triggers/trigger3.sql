CREATE DEFINER=`root`@`%` TRIGGER `trg_payment_check` BEFORE INSERT ON `Order_Payments` FOR EACH ROW BEGIN
    IF NEW.payment_value <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'payment_value must be greater than 0';
    END IF;
END
