const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/register", async (req, res) => {
  const { customerId } = req.body;

  if (!customerId || !customerId.trim()) {
    return res.status(400).json({ error: "請輸入 Customer ID" });
  }

  try {
    // 確認 ID 是否已存在
    const [existing] = await db.query(
      "SELECT customer_id FROM Customers WHERE customer_id = ?",
      [customerId.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "此 Customer ID 已被使用" });
    }

    await db.query(
      "INSERT INTO Customers (customer_id, customer_unique_id, customer_zip_code_prefix, customer_city) VALUES (?, UUID(), '106', '')",
      [customerId.trim()]
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
