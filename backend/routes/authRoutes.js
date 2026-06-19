const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/register", async (req, res) => {
  const { customerId, city } = req.body;
  if (!customerId || !customerId.trim()) {
    return res.status(400).json({ error: "請輸入 Customer ID" });
  }
  try {
    const [existing] = await db.query(
      "SELECT customer_id FROM Customers WHERE customer_id = ?",
      [customerId.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "此 Customer ID 已被使用" });
    }

    // 用 city 查 zip_code_prefix，查不到就預設 '000'
    let zipCode = '000';
    if (city) {
      const [geoRows] = await db.query(
        "SELECT geolocation_zip_code_prefix FROM Geolocation WHERE geolocation_city = ? LIMIT 1",
        [city.trim()]
      );
      if (geoRows.length > 0) {
        zipCode = String(geoRows[0].geolocation_zip_code_prefix);
      }
    }

    await db.query(
      "INSERT INTO Customers (customer_id, customer_unique_id, customer_zip_code_prefix, customer_city) VALUES (?, UUID(), ?, ?)",
      [customerId.trim(), zipCode, city?.trim() || '']
    );

    res.status(201).json({
      message: "註冊成功",
      customer_id: customerId.trim(),
      name: customerId.trim()
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "伺服器錯誤: " + err.message });
  }
});

module.exports = router;
