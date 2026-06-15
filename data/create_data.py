import csv
from datetime import datetime, timedelta
import random

# 設定隨機種子以確保重複執行結果相同（可自由移除）
random.seed(42)

# --- 1. 模擬基礎資料準備 ---
zip_codes = ["100", "400", "800"]
cities = ["Taipei", "Taichung", "Kaohsiung"]
states = ["TP", "TC", "KH"]
lats = [25.0330, 24.1477, 22.6273]
lngs = [121.5654, 120.6736, 120.3014]

# 商品分類對照表（前端 CATS <-> DB product_category_name）
# Electronics   <-> electronics
# Fashion       <-> fashion
# Home & Living <-> home_living
# Sports        <-> sports
# Books         <-> books
# Beauty        <-> beauty
# Toys          <-> toys
CATEGORY_LABELS = {
    "electronics": "Electronics",
    "fashion": "Fashion",
    "home_living": "Home & Living",
    "sports": "Sports",
    "books": "Books",
    "beauty": "Beauty",
    "toys": "Toys",
}

# --- 2. 生成各資料表數據 ---

# 1. Geolocation
geolocation_data = []
for i in range(len(zip_codes)):
    geolocation_data.append(
        [zip_codes[i], lats[i], lngs[i], cities[i], states[i]]
    )


# 3. Customers
customer_data = []
customer_ids = [f"cust_{i}" for i in range(1, 6)]  # 5位買家
for i, cust_id in enumerate(customer_ids):
    idx = i % len(zip_codes)
    customer_data.append(
        [cust_id, f"uniq_cust_{i+1}", zip_codes[idx], cities[idx], states[idx]]
    )

# 4. Sellers
seller_data = []
seller_ids = [f"sell_{i}" for i in range(1, 4)]  # 3位賣家
for i, sell_id in enumerate(seller_ids):
    idx = (i + 1) % len(zip_codes)
    seller_data.append([sell_id, zip_codes[idx], cities[idx], states[idx]])

# 5. Products
# ⚠️ 商品資料改為「手動策劃」而非 faker 隨機生成，
# 確保每個商品的名稱、分類、價格、規格彼此一致，
# 不會再出現「商品叫 Bluetooth Speaker 但分類是 books」這種對不上的情況。
#
# 共 30 筆，對應前端 7 大分類各 4~5 筆。
# 欄位順序對應 Products.csv / db_data.sql / 遠端 DB schema：
# product_id, product_name, product_category_name, product_name_length,
# product_description_length, product_photos_qty, product_weight_g,
# product_length_cm, product_height_cm, product_width_cm,
# product_available, product_price
PRODUCT_CATALOG = [
    ("prod_1",  "Bluetooth Speaker",           "electronics", 17, 120, 4,   450, 20,  8,  8, 1, 1290.00),
    ("prod_2",  "Wireless Earbuds",            "electronics", 16, 140, 5,    60,  6,  3,  6, 1, 1990.00),
    ("prod_3",  "Smart Watch",                 "electronics", 11, 160, 4,    45,  4,  1,  4, 1, 3990.00),
    ("prod_4",  "Mechanical Keyboard",         "electronics", 19, 130, 3,   950, 44,  4, 14, 1, 2890.00),
    ("prod_5",  "Portable Power Bank",         "electronics", 19,  95, 3,   250, 14,  2,  7, 0,  890.00),
    ("prod_6",  "Canvas Tote Bag",             "fashion",     15, 110, 4,   300, 40, 35, 12, 1,  390.00),
    ("prod_7",  "Denim Jacket",                "fashion",     12, 150, 5,   600, 70, 60,  5, 1, 1690.00),
    ("prod_8",  "Leather Wallet",              "fashion",     14, 105, 3,   120, 11,  9,  2, 1,  990.00),
    ("prod_9",  "Running Sneakers",            "fashion",     16, 145, 5,   700, 30, 12, 11, 1, 2290.00),
    ("prod_10", "Ceramic Mug Set",             "home_living", 15, 100, 4,  1200, 25, 12, 18, 1,  450.00),
    ("prod_11", "LED Desk Lamp",               "home_living", 13,  90, 3,   800, 20, 45, 15, 1,  760.00),
    ("prod_12", "Bamboo Cutting Board",        "home_living", 20, 125, 2,   650, 35,  2, 25, 1,  380.00),
    ("prod_13", "Cotton Bed Sheet Set",        "home_living", 20, 160, 4,  1500, 40, 30, 10, 0, 1590.00),
    ("prod_14", "Yoga Mat",                    "sports",       8,  80, 3,   900, 60,  6, 15, 1,  680.00),
    ("prod_15", "Resistance Bands Set",        "sports",      20, 115, 3,   400, 25,  5, 20, 1,  590.00),
    ("prod_16", "Jump Rope",                   "sports",       9,  70, 2,   150, 25,  3,  3, 1,  290.00),
    ("prod_17", "Adjustable Dumbbell Set",     "sports",      23, 175, 4, 12000, 40, 20, 20, 1, 2490.00),
    ("prod_18", "Novel: The Shore",            "books",       16,  90, 1,   350, 21, 14,  2, 1,  280.00),
    ("prod_19", "Modern Cookbook",             "books",       15, 110, 3,   700, 24, 18,  3, 1,  450.00),
    ("prod_20", "Practical Python Guide",      "books",       22, 180, 2,   600, 23, 17,  3, 1,  620.00),
    ("prod_21", "Children's Picture Book Set", "books",       27, 200, 5,   900, 25, 20,  5, 1,  990.00),
    ("prod_22", "Sunscreen SPF50",             "beauty",      15,  85, 2,    80,  4, 12,  4, 1,  320.00),
    ("prod_23", "Facial Cleanser",             "beauty",      15,  95, 3,   150,  5, 15,  5, 1,  280.00),
    ("prod_24", "Makeup Brush Set",            "beauty",      16, 120, 4,   200, 18,  4, 10, 1,  690.00),
    ("prod_25", "Moisturizing Hand Cream",     "beauty",      23, 100, 2,   100,  4, 10,  4, 0,  350.00),
    ("prod_26", "Building Blocks Set",         "toys",        19, 150, 5,  1800, 40, 30, 10, 1,  990.00),
    ("prod_27", "Remote Control Car",          "toys",        18, 135, 4,  1200, 35, 15, 18, 1, 1290.00),
    ("prod_28", "Plush Bear",                  "toys",        10,  75, 3,   400, 30, 40, 20, 1,  450.00),
    ("prod_29", "Wooden Puzzle Set",           "toys",        17, 110, 3,   600, 25,  5, 25, 1,  380.00),
    ("prod_30", "Educational Robot Kit",       "toys",        21, 160, 5,  1500, 35, 25, 15, 1, 1990.00),
]
# product_price 統一格式化為兩位小數字串 (例如 1290.00)，
# 避免 csv 輸出變成 1290.0 跟 db_data.sql 裡的 1290.00 對不齊
product_data = [list(row[:-1]) + [f"{row[-1]:.2f}"] for row in PRODUCT_CATALOG]

# 6. Orders & 7. Order_Items & 8. Order_Payments & 9. Order_Reviews
# 為了邏輯關聯，這四張表的時序與 ID 一起連動生成
order_data = []
order_items_data = []
payment_data = []
review_data = []

order_ids = [f"ord_{i}" for i in range(1, 6)]  # 5筆訂單

# Order_Items 隨機抽商品時，只從 PRODUCT_CATALOG 的前 5 筆 (prod_1~prod_5，
# 即 Bluetooth Speaker / Wireless Earbuds / Smart Watch / Mechanical Keyboard /
# Portable Power Bank，皆為 electronics) 抽選。
#
# ⚠️ 注意：因為移除了舊版「隨機產生商品規格」的迴圈 (原本會消耗 40 次
# random() 呼叫)，random.seed(42) 之下的整體隨機序列已經改變，
# 重新執行本程式會讓 Orders / Order_Items / Order_Payments / Order_Reviews
# 產生「不同但同樣有效」的範例數值（筆數、金額等可能跟舊版 CSV 不同），
# 但仍會滿足所有外鍵與 CHECK 約束 (product_id 一定落在 prod_1~prod_5 之間)。
product_ids = [row[0] for row in PRODUCT_CATALOG[:5]]

statuses = [
    "delivered",
    "shipped",
    "delivered",
    "processing",
    "canceled",
]  # 符合 CHECK 約束
payment_types = ["credit_card", "voucher", "debit_card", "transfer"]

base_time = datetime(2026, 6, 1)

for i, ord_id in enumerate(order_ids):
    # 時間軸模擬
    purchase_time = base_time + timedelta(
        days=i, hours=random.randint(1, 10)
    )
    approved_time = purchase_time + timedelta(minutes=random.randint(10, 60))
    carrier_time = (
        approved_time + timedelta(days=1)
        if statuses[i] in ["shipped", "delivered"]
        else ""
    )
    customer_time = (
        carrier_time + timedelta(days=2) if statuses[i] == "delivered" else ""
    )
    est_delivery_time = purchase_time + timedelta(days=7)
    ship_limit_time = purchase_time + timedelta(days=3)

    # 6. 寫入訂單主表
    cust_id = random.choice(customer_ids)
    order_data.append(
        [
            ord_id,
            cust_id,
            statuses[i],
            purchase_time.strftime("%Y-%m-%d %H:%M:%S"),
            approved_time.strftime("%Y-%m-%d %H:%M:%S"),
            (
                carrier_time.strftime("%Y-%m-%d %H:%M:%S")
                if carrier_time
                else None
            ),
            (
                customer_time.strftime("%Y-%m-%d %H:%M:%S")
                if customer_time
                else None
            ),
            est_delivery_time.strftime("%Y-%m-%d %H:%M:%S"),
            ship_limit_time.strftime("%Y-%m-%d %H:%M:%S"),
        ]
    )

    # 7. 寫入訂單項目表 (每筆訂單隨機 1~2 個項目)
    item_count = random.randint(1, 2)
    total_order_value = 0
    for item_idx in range(1, item_count + 1):
        prod_id = random.choice(product_ids)
        sell_id = random.choice(seller_ids)
        price = round(random.uniform(10.0, 500.0), 2)
        freight = round(random.uniform(5.0, 30.0), 2)
        qty = random.randint(1, 2)

        total_order_value += (price * qty) + freight
        order_items_data.append(
            [
                ord_id,
                item_idx,
                prod_id,
                sell_id,
                ship_limit_time.strftime("%Y-%m-%d %H:%M:%S"),
                price,
                freight,
                qty,
            ]
        )

    # 8. 寫入付款紀錄表 (簡單處理：一筆訂單付一次款)
    p_type = random.choice(payment_types)
    installments = random.choice([1, 3, 6]) if p_type == "credit_card" else 1
    payment_data.append(
        [ord_id, 1, p_type, installments, round(total_order_value, 2)]
    )

    # 9. 寫入評價紀錄表 (只針對已完成或有狀態的訂單給評價)
    if statuses[i] in ["delivered", "canceled"]:
        review_time = (
            customer_time + timedelta(days=1)
            if customer_time
            else purchase_time + timedelta(days=4)
        )
        review_data.append(
            [
                f"rev_{i+1}",
                ord_id,
                random.randint(1, 5),
                f"Title {i+1}",
                f"Comment message for order {ord_id}.",
                review_time.strftime("%Y-%m-%d %H:%M:%S"),
                (review_time + timedelta(hours=5)).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
            ]
        )

# --- 3. 定義欄位名稱並寫入 CSV 檔案 ---

files_and_headers = {
    "Geolocation.csv": [
        "geolocation_zip_code_prefix",
        "geolocation_lat",
        "geolocation_lng",
        "geolocation_city",
        "geolocation_state",
    ],
    "Customers.csv": [
        "customer_id",
        "customer_unique_id",
        "customer_zip_code_prefix",
        "customer_city",
        "customer_state",
    ],
    "Sellers.csv": [
        "seller_id",
        "seller_zip_code_prefix",
        "seller_city",
        "seller_state",
    ],
    "Products.csv": [
        "product_id",
        "product_name",
        "product_category_name",
        "product_name_length",
        "product_description_length",
        "product_photos_qty",
        "product_weight_g",
        "product_length_cm",
        "product_height_cm",
        "product_width_cm",
        "product_available",
        "product_price",
    ],
    "Orders.csv": [
        "order_id",
        "customer_id",
        "order_status",
        "order_purchase_timestamp",
        "order_approved_at",
        "order_delivered_carrier_date",
        "order_delivered_customer_date",
        "order_estimated_delivery_date",
        "shipping_limit_date",
    ],
    "Order_Items.csv": [
        "order_id",
        "order_item_id",
        "product_id",
        "seller_id",
        "shipping_limit_date",
        "price",
        "freight_value",
        "order_item_quantity",
    ],
    "Order_Payments.csv": [
        "order_id",
        "payment_sequential",
        "payment_type",
        "payment_installments",
        "payment_value",
    ],
    "Order_Reviews.csv": [
        "review_id",
        "order_id",
        "review_score",
        "review_comment_title",
        "review_comment_message",
        "review_creation_date",
        "review_answer_timestamp",
    ],
}

data_mapping = {
    "Geolocation.csv": geolocation_data,
    "Customers.csv": customer_data,
    "Sellers.csv": seller_data,
    "Products.csv": product_data,
    "Orders.csv": order_data,
    "Order_Items.csv": order_items_data,
    "Order_Payments.csv": payment_data,
    "Order_Reviews.csv": review_data,
}

# 執行寫入
for filename, headers in files_and_headers.items():
    with open(
        filename, mode="w", newline="", encoding="utf-8-sig"
    ) as file:  # 使用 utf-8-sig 確保 Excel 開啟不亂碼
        writer = csv.writer(file)
        writer.writerow(headers)
        writer.writerows(data_mapping[filename])
    print(f"已成功產出：{filename}，共 {len(data_mapping[filename])} 筆資料。")
