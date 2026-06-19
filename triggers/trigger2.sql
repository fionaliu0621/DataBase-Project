CREATE DEFINER=`root`@`%` TRIGGER `trg_review_check` BEFORE INSERT ON `Order_Reviews` FOR EACH ROW BEGIN
    IF NEW.review_score < 1 OR NEW.review_score > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'review_score must be between 1 and 5';
    END IF;
END
