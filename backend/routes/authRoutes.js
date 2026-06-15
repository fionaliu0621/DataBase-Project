const express = require("express");
const router = express.Router();
const db = require("../config/db");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { firstName, lastName, city, zipCode } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: "姓名為必填" });
  }

  try {
    // 自動產生新的 customer_id（格式 cust_000001）
    const [rows] = await db.query(
      "SELECT customer_id FROM Customers ORDER BY customer_id DESC LIMIT 1"
    );
    let newId = "cust_000001";
    if (rows.length > 0) {
      const lastNum = parseInt(rows[0].customer_id.split("_")[1]);
      newId = "cust_" + String(lastNum + 1).padStart(6, "0");
    }

    await db.query(
      "INSERT INTO Customers (customer_id, customer_unique_id, customer_zip_code_prefix, customer_city) VALUES (?, UUID(), ?, ?)",
      [newId, zipCode || "000", city || ""]
    );

    res.status(201).json({
      message: "註冊成功",
      customer_id: newId,
      name: `${firstName} ${lastName}`
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "伺服器錯誤: " + err.message });
  }
});

module.exports = router;
