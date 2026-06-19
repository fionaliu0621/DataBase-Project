CREATE DEFINER=`root`@`%` PROCEDURE `GetSellerRevenue`(
    IN p_seller_id VARCHAR(50)
)
BEGIN
    SELECT 
        s.seller_id,
        s.seller_city,
        COUNT(oi.order_id) AS total_orders,
        SUM(oi.price * oi.order_item_quantity) AS total_price,
        SUM(oi.freight_value) AS total_freight,
        SUM(oi.price * oi.order_item_quantity + oi.freight_value) AS total_revenue
    FROM Sellers s
    JOIN Order_Items oi ON s.seller_id COLLATE utf8mb4_unicode_ci = oi.seller_id COLLATE utf8mb4_unicode_ci
    JOIN Orders o ON oi.order_id COLLATE utf8mb4_unicode_ci = o.order_id COLLATE utf8mb4_unicode_ci
    WHERE s.seller_id COLLATE utf8mb4_unicode_ci = p_seller_id COLLATE utf8mb4_unicode_ci
    AND o.order_status = 'delivered'
    GROUP BY s.seller_id, s.seller_city;
END
