# 資料庫期末專案

本專案為一個前後端分離的現代化電商後端系統，涵蓋了從**虛擬資料流生成**、**資料庫實體關係建模（ERD）**、**MVC 分層架構開發**，到最終**雲端容器化生產環境部署**的完整工程實作。

---

## 一、 資料工程與初始化 (Data Engineering)

為了模擬真實電商海量的交易情境，本專案建構了一套自動化資料生成與導入管線（Data Pipeline）：

### 1. 關聯式資料庫結構設計 (`db_data.sql`)
編寫結構定義語言（DDL）腳本，於 MySQL 中精準建立 **8 個核心實體資料表**。嚴格宣告主鍵（Primary Key）、外鍵（Foreign Key）約束與資料型態：
* `Geolocation`（地理位置）
* `Customers`（消費者資料）
* `Sellers`（商家資料）
* `Products`（商品主表）
* `Orders`（訂單主表）
* `Order_Items`（訂單明細流水表）
* `Order_Payments`（支付紀錄表）
* `Order_Reviews`（商品與商家評論表）

### 2. 數據合成 (`creat_data.py`)
* 使用 **`Faker` 數據合成套件**。
* 透過演算法產生不同商品類別、消費者行為的隨機數值，自動化導出 **9 個結構化 CSV 數據檔案**。

### 3.資料載入 (`import_data.py`)
* 利用 **`pandas`** 進行數據清洗與結構化轉換。
* **`sqlalchemy`（SQL 工具包）** 將 CSV 資料輸入 MySQL 資料庫。

---

## 二、 後端系統架構 (Backend Architecture)

系統基於 **Node.js** 執行環境，並透過 **NPM (Node Package Manager)** 進行套件管理。

### 1. 核心技術選型 (Technical Stack)
* **`express`**：網頁框架、建立 API。
* **`mysql2`**：連接 MySQL 的驅動程式，並實作 **Connection Pool（連線池）機制**。
* **`dotenv`**：管理環境變數。
* **`cors`**：Cross-origin resource sharing 跨來源資源共享。

### 2. 專案資料夾結構

```text
backend/
├── config/                  # 資料庫基本配置區
│   └── db.js                #    - 建立 mysql2 Pool 連線池並導出 Promise 抽象層
├── controllers/             # 
│   ├── orderController.js   #    - 處理訂單任務 (Stored Procedure)
│   └── productController.js #    - 處理多條件商品篩選、跨表 JOIN 商家數據
├── routes/                  # 路由分派區 (Routes)
│   ├── orderRoutes.js       #    - 負責定義 /api/orders/* 端點的去向
│   └── productRoutes.js     #    - 負責定義 /api/products/* 端點的去向
├── .env                     # 環境變數
├── package.json             # 專案相依套件與啟動腳本清單 (NPM Scripts)
└── server.js                # 伺服器總入口 (初始化 Middleware、監聽全網卡 Port)
```

## 三、 雲端部署
Railway
```
public internet
├── 瀏覽網頁
│   └── 前端server
└── 發送 API 請求            # 
    └── 後端server   #    - 處理訂單任務 (Stored Procedure)
        └──---資料庫
```
* 前端server domain:  https://delightful-fascination-production-82e0.up.railway.app
* 後端server domain:  https://database-project-production-aefc.up.railway.app 



<img width="1536" height="894" alt="螢幕擷取畫面 2026-06-16 005205" src="https://github.com/user-attachments/assets/f820c718-9061-49df-b8da-ce27a7974914" />








## backend
* 跟之前的電影網頁一樣，資料夾存在xampp，開apache

* mysql workbench 連老師的機器，裡面有已經載好的一點點測試資料，每個table都有(除了translate的部分刪掉了以外)，更完整的資料可以再整理，或是之後直接用寫好的介面加入資料，也可以修改、執行data/db_data.sql新增資料

* 下載nodejs https://nodejs.org/zh-tw/download
```
node -v
npm init -y
npm install express mysql2 dotenv cors
node server.js
```

* 取得所有order的api http://localhost:3000/api/orders

* 取得單筆order的api http://localhost:3000/api/orders/ord_3

先用local開發，之後可以部署到其他平台
