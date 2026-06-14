import csv
from datetime import datetime, timedelta
import random
from faker import Faker
import uuid
import os
import faker_commerce

fake = Faker()
fake.add_provider(faker_commerce.Provider)
random.seed(42)
SCALE_FACTOR = 100

NUM_GEOLOCATION = 50
NUM_CUSTOMERS = SCALE_FACTOR * 5
NUM_SELLERS = SCALE_FACTOR * 1
NUM_PRODUCTS = SCALE_FACTOR * 2
NUM_ORDERS = SCALE_FACTOR * 10
# --- 1. 模擬基礎資料準備 ---
# zip_codes = ["100", "400", "800"]
# cities = ["Taipei", "Taichung", "Kaohsiung"]
# lats = [25.0330, 24.1477, 22.6273]
# lngs = [121.5654, 120.6736, 120.3014]

# categories = ["home_appliances", "electronics", "books"]
# categories_en = ["Home Appliances", "Electronics", "Books"]

# --- 2. 生成各資料表數據 ---

# 1. Geolocation
# zip_codes = [f"{random.randint(100, 999):05d}" for _ in range(NUM_GEOLOCATION)]
unique_zip_ints = random.sample(range(100, 1000), NUM_GEOLOCATION)
zip_codes = [f"{z:03d}" for z in unique_zip_ints]
geolocation_data = [[
    zip, float(fake.latitude()), float(fake.longitude()), fake.city()[:20]
] for zip in zip_codes]

# geolocation_data = []
# for i in range(len(zip_codes)):
#     geolocation_data.append(
#         [zip_codes[i], lats[i], lngs[i], cities[i]]
#     )


# 3. Customers
customer_ids = [f"cust_{i:06d}" for i in range(1, NUM_CUSTOMERS + 1)]
customer_data = [[
    cid, str(uuid.uuid4())[:20], random.choice(zip_codes), fake.city()[:20]
] for cid in customer_ids]

# customer_data = []
# customer_ids = [f"cust_{i}" for i in range(1, 6)]  # 5位買家
# for i, cust_id in enumerate(customer_ids):
#     idx = i % len(zip_codes)
#     customer_data.append(
#         [cust_id, f"uniq_cust_{i+1}", zip_codes[idx], cities[idx]]
#     )

# 4. Sellers
seller_ids = [f"sell_{i:04d}" for i in range(1, NUM_SELLERS + 1)]
seller_data = [[
    sid, random.choice(zip_codes), fake.city()[:20]
] for sid in seller_ids]

# seller_data = []
# seller_ids = [f"sell_{i}" for i in range(1, 4)]  # 3位賣家
# for i, sell_id in enumerate(seller_ids):
#     idx = (i + 1) % len(zip_codes)
#     seller_data.append([sell_id, zip_codes[idx], cities[idx]])

# 5. Products
# categories = ["home_appliances", "electronics", "books", "fashion", "toys", "automotive"]
product_ids = [f"prod_{i:05d}" for i in range(1, NUM_PRODUCTS + 1)]
product_data = [[
    pid, fake.ecommerce_name()[:20], fake.ecommerce_category()[:20], random.randint(10, 40), random.randint(50, 300),
    random.randint(1, 8), random.randint(100, 8000), random.randint(10, 80),
    random.randint(5, 50), random.randint(5, 50), random.choice([0, 1]), random.randint(10, 10000)
] for pid in product_ids]

# product_data = []
# product_ids = [f"prod_{i}" for i in range(1, 6)]  # 5個商品
# product_names = [f"prod_{i}" for i in range(1, 6)]
# for i, prod_id in enumerate(product_ids):
#     cat = categories[i % len(categories)]
#     prod_name = product_names[i % len(product_names)]
#     product_data.append(
#         [
#             prod_id,
#             prod_name,
#             cat,
#             random.randint(10, 30),
#             random.randint(50, 200),
#             random.randint(1, 5),
#             random.randint(200, 5000),
#             random.randint(15, 60),
#             random.randint(10, 40),
#             random.randint(10, 40),
#             random.choice([0, 1]),
#             random.randint(100, 4000),
#         ]
#     )

# 6. Orders & 7. Order_Items & 8. Order_Payments & 9. Order_Reviews
# 為了邏輯關聯，這四張表的時序與 ID 一起連動生成
order_data = []
order_items_data = []
payment_data = []
review_data = []

statuses = ['delivered', 'delivered', 'delivered', 'shipped', 'processing', 'canceled', 'refund']
payment_types = ["credit_card", "cash", "debit_card", "transfer"]
base_start_date = datetime(2025, 1, 1)

for i in range(1, NUM_ORDERS + 1):
    ord_id = f"ord_{i:07d}"
    status = random.choice(statuses)
    
    # 🕒 嚴格的時序合理性模擬
    purchase_time = base_start_date + timedelta(
        seconds=random.randint(0, 365 * 24 * 3600)
    ) # 均勻分佈在一年內
    
    approved_time = purchase_time + timedelta(minutes=random.randint(5, 120)) if status != 'created' else None
    
    # 物流時間採用隨機天數，模擬真實配送
    carrier_time = approved_time + timedelta(days=random.randint(1, 2)) if status in ['shipped', 'delivered'] else None
    customer_time = carrier_time + timedelta(days=random.randint(2, 5)) if status == 'delivered' else None
    
    # 取消訂單的邏輯清洗
    if status == 'canceled':
        approved_time = approved_time if random.random() > 0.3 else None
        carrier_time = None
        customer_time = None

    est_delivery_time = purchase_time + timedelta(days=7)
    ship_limit_time = purchase_time + timedelta(days=3)

    def fmt(dt): return dt.strftime("%Y-%m-%d %H:%M:%S") if dt else None

    # 寫入 Orders 主表
    cust_id = random.choice(customer_ids)
    order_data.append([
        ord_id, cust_id, status, fmt(purchase_time), fmt(approved_time),
        fmt(carrier_time), fmt(customer_time), fmt(est_delivery_time), fmt(ship_limit_time)
    ])

    # 寫入 Order_Items (每筆訂單隨機 1~3 件商品)
    item_count = random.randint(1, 3)
    total_order_value = 0
    
    for item_idx in range(1, item_count + 1):
        prod_id = random.choice(product_ids)
        sell_id = random.choice(seller_ids)
        price = round(random.uniform(15.0, 1200.0), 2)     # 合理的商品價格區間
        freight = round(random.uniform(5.0, 45.0), 2)       # 合理的運費區間
        qty = random.choice([1, 1, 1, 1, 2, 3])            # 購買數量權重（1件居多）

        total_order_value += (price * qty) + freight
        order_items_data.append([ord_id, item_idx, prod_id, sell_id, fmt(ship_limit_time), price, freight, qty])

    # 寫入 Order_Payments (金額與 Items 精確連動)
    p_type = random.choice(payment_types)
    installments = random.choice([1, 1, 1, 3, 6, 12]) if p_type == "credit_card" else 1
    payment_data.append([ord_id, 1, p_type, installments, round(total_order_value, 2)])

    # 寫入 Order_Reviews (只有已送達或取消的訂單有機會觸發評價)
    if status in ["delivered", "canceled"] and random.random() > 0.4:  # 60% 評價率
        rev_time = customer_time + timedelta(days=random.randint(1, 3)) if customer_time else purchase_time + timedelta(days=5)
        review_data.append([
            f"rev_{i:07d}", ord_id, random.choice([5, 5, 4, 4, 3, 2, 1]), # 模擬好評居多
            fake.sentence(nb_words=3)[:-1], fake.paragraph(nb_sentences=2),
            fmt(rev_time), fmt(rev_time + timedelta(hours=random.randint(2, 24)))
        ])

# order_ids = [f"ord_{i}" for i in range(1, 6)]  # 5筆訂單
# statuses = [
#     "delivered",
#     "shipped",
#     "delivered",
#     "processing",
#     "canceled",
# ]  # 符合 CHECK 約束
# payment_types = ["credit_card", "voucher", "debit_card", "transfer"]

# base_time = datetime(2026, 6, 1)

# for i, ord_id in enumerate(order_ids):
#     # 時間軸模擬
#     purchase_time = base_time + timedelta(
#         days=i, hours=random.randint(1, 10)
#     )
#     approved_time = purchase_time + timedelta(minutes=random.randint(10, 60))
#     carrier_time = (
#         approved_time + timedelta(days=1)
#         if statuses[i] in ["shipped", "delivered"]
#         else ""
#     )
#     customer_time = (
#         carrier_time + timedelta(days=2) if statuses[i] == "delivered" else ""
#     )
#     est_delivery_time = purchase_time + timedelta(days=7)
#     ship_limit_time = purchase_time + timedelta(days=3)

#     # 6. 寫入訂單主表
#     cust_id = random.choice(customer_ids)
#     order_data.append(
#         [
#             ord_id,
#             cust_id,
#             statuses[i],
#             purchase_time.strftime("%Y-%m-%d %H:%M:%S"),
#             approved_time.strftime("%Y-%m-%d %H:%M:%S"),
#             (
#                 carrier_time.strftime("%Y-%m-%d %H:%M:%S")
#                 if carrier_time
#                 else None
#             ),
#             (
#                 customer_time.strftime("%Y-%m-%d %H:%M:%S")
#                 if customer_time
#                 else None
#             ),
#             est_delivery_time.strftime("%Y-%m-%d %H:%M:%S"),
#             ship_limit_time.strftime("%Y-%m-%d %H:%M:%S"),
#         ]
#     )

#     # 7. 寫入訂單項目表 (每筆訂單隨機 1~2 個項目)
#     item_count = random.randint(1, 2)
#     total_order_value = 0
#     for item_idx in range(1, item_count + 1):
#         prod_id = random.choice(product_ids)
#         sell_id = random.choice(seller_ids)
#         price = round(random.uniform(10.0, 500.0), 2)
#         freight = round(random.uniform(5.0, 30.0), 2)
#         qty = random.randint(1, 2)

#         total_order_value += (price * qty) + freight
#         order_items_data.append(
#             [
#                 ord_id,
#                 item_idx,
#                 prod_id,
#                 sell_id,
#                 ship_limit_time.strftime("%Y-%m-%d %H:%M:%S"),
#                 price,
#                 freight,
#                 qty,
#             ]
#         )

#     # 8. 寫入付款紀錄表 (簡單處理：一筆訂單付一次款)
#     p_type = random.choice(payment_types)
#     installments = random.choice([1, 3, 6]) if p_type == "credit_card" else 1
#     payment_data.append(
#         [ord_id, 1, p_type, installments, round(total_order_value, 2)]
#     )

#     # 9. 寫入評價紀錄表 (只針對已完成或有狀態的訂單給評價)
#     if statuses[i] in ["delivered", "canceled"]:
#         review_time = (
#             customer_time + timedelta(days=1)
#             if customer_time
#             else purchase_time + timedelta(days=4)
#         )
#         review_data.append(
#             [
#                 f"rev_{i+1}",
#                 ord_id,
#                 random.randint(1, 5),
#                 f"Title {i+1}",
#                 f"Comment message for order {ord_id}.",
#                 review_time.strftime("%Y-%m-%d %H:%M:%S"),
#                 (review_time + timedelta(hours=5)).strftime(
#                     "%Y-%m-%d %H:%M:%S"
#                 ),
#             ]
#         )

# --- 3. 定義欄位名稱並寫入 CSV 檔案 ---

files_and_headers = {
    "Geolocation.csv": [
        "geolocation_zip_code_prefix",
        "geolocation_lat",
        "geolocation_lng",
        "geolocation_city",
    ],
    "Customers.csv": [
        "customer_id",
        "customer_unique_id",
        "customer_zip_code_prefix",
        "customer_city",
    ],
    "Sellers.csv": [
        "seller_id",
        "seller_zip_code_prefix",
        "seller_city",
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