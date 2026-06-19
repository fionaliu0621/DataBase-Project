import os
import pandas as pd
from sqlalchemy import create_engine, text

# 資料庫連線設定 (請替換為你們小組實際的 AppServ/MySQL 帳密)
USER = "team11"
PASSWORD = "2p5fEhW#FH7M"
HOST = "140.122.184.121"
PORT = "3306"
DB_NAME = "team11"
# railway
engine = create_engine("mysql+pymysql://root:lgQDrysfnZuyOzkWrAFleVTOxTCuNoGZ@thomas.proxy.rlwy.net:57286/railway")
#local
# engine = create_engine(f"mysql+pymysql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DB_NAME}")

# ⚠️ 關鍵：依據外鍵相依性排定嚴格的匯入順序
import_order = [
    ("Geolocation.csv", "Geolocation"),
    ("Customers.csv", "Customers"),
    ("Sellers.csv", "Sellers"),
    ("Products.csv", "Products"),
    ("Orders.csv", "Orders"),
    ("Order_Items.csv", "Order_Items"),
    ("Order_Payments.csv", "Order_Payments"),
    ("Order_Reviews.csv", "Order_Reviews")
]

print("🚀 開始進行 FK 完整性驗證與批量匯入...")

for csv_file, table_name in import_order:
    if not os.path.exists(csv_file):
        print(f"❌ 找不到檔案 {csv_file}，請先執行生成腳本！")
        continue
        
    try:
        # 讀取 CSV 檔
        df = pd.read_csv(csv_file)
        
        with engine.connect() as conn:
            # 暫時關閉外鍵檢查，否則 Customers 依賴它時會不讓你清空
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
            conn.execute(text(f"TRUNCATE TABLE `{table_name}`;"))
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        print(f"🧹 已清空雲端 [{table_name}] 的舊資料，準備重新寫入...")

        # if_exists='append' 代表保留 DDL 結構，純粹塞入資料
        # chunksize 確保大資料量時不會卡死
        df.to_sql(name=table_name, con=engine, if_exists='append', index=False, chunksize=1000)
        print(f"✅ 資料表 [{table_name}] 匯入成功！驗證無誤，共 {len(df)} 筆資料。")
        
    except Exception as e:
        print(f"💥 匯入 [{table_name}] 時發生衝突！外鍵驗證失敗或資料型態不符。")
        print(f"錯誤詳細訊息:\n{e}")
        break