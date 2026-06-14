CREATE TABLE Order_Status_Log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50),
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);