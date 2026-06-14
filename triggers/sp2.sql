DELIMITER $$

CREATE PROCEDURE GetSellerRevenue(
    IN p_seller_id VARCHAR(50)
)
BEGIN
    SELECT 
        s.seller_id,
        s.seller_city,
        COUNT(oi.order_id) AS total_orders,
        SUM(oi.price * oi.quantity) AS total_price,
        SUM(oi.freight_value) AS total_freight,
        SUM(oi.price * oi.quantity + oi.freight_value) AS total_revenue
    FROM Sellers s
    JOIN Order_Items oi ON s.seller_id = oi.seller_id
    JOIN Orders o ON oi.order_id = o.order_id
    WHERE s.seller_id = p_seller_id
    AND o.order_status = 'delivered'
    GROUP BY s.seller_id, s.seller_city;
END$$

DELIMITER ;