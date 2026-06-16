# 資料庫期末專案

本專案為一個前後端分離的現代化電商後端系統，涵蓋了從**虛擬資料流生成**、**資料庫實體關係建模（ERD）**、**MVC 分層架構開發**，到最終**雲端容器化生產環境部署**的完整工程實作。

---

## 一、 資料工程與初始化 (Data Engineering)

為了模擬真實電商海量的交易情境，本專案建構了一套自動化資料生成與導入管線（Data Pipeline）：

### 1. 關聯式資料庫結構設計 (`db_data.sql`)
編寫結構定義語言（DDL）腳本，於 MySQL 中精準建立 **8 個核心實體資料表**。嚴格宣告主鍵（Primary Key）、外鍵（Foreign Key）約束與資料型態：
* `Geolocation`（地理位置數據）
* `Customers`（消費者資料）
* `Sellers`（商家資料）
* `Products`（商品主表）
* `Orders`（訂單主表）
* `Order_Items`（訂單明細流水表）
* `Order_Payments`（支付紀錄表）
* `Order_Reviews`（商品與商家評論表）

### 2. 偽隨機數據合成引擎 (`creat_data.py`)
* 使用 Python 核心技術，導入 **`Faker` 數據合成套件**。
* 透過演算法產生不同商品類別、消費者行為的隨機數值，自動化導出 **9 個結構化 CSV 數據檔案**。

### 3. 高速資料高速載入器 (`import_data.py`)
* 利用 **`pandas`** 進行數據清洗與結構化轉換。
* 結合 **`sqlalchemy`（SQL 工具包）** 機制，將大量 CSV 資料以批次（Batch）形式高速封裝並灌入雲端 MySQL 資料庫。

---

## 二、 後端系統架構 (Backend Architecture)

系統基於 **Node.js** 執行環境，並透過 **NPM (Node Package Manager)** 進行相依性套件生命週期管理。

### 1. 核心技術選型 (Technical Stack)
* **`express`**：基於事件驅動的輕量級 HTTP Web 框架，建構 RESTful API 中間件洋蔥模型管道。
* **`mysql2`**：支援 MySQL 封裝協定的高效能驅動程式，並實作 **Connection Pool（連線池）機制**，配置持久連線與排隊隊列，防止高併發（High Concurrency）時資料庫過載。
* **`dotenv`**：遵循 *The Twelve-Factor App* 宣言，落實環境配置隔離，確保敏感憑證不外洩。
* **`cors`**：動態調控 HTTP 響應標頭，安全解鎖瀏覽器「同源政策（Same-Origin Policy）」限制，打通前後端通訊渠道。

### 2. MVC 分層專案資料夾結構
專案採用軟體工程解耦原則，將路由分發、業務邏輯與基礎配置徹底抽離：

```text
backend/
├── config/                  # 🔌 資料庫基本配置區
│   └── db.js                #    - 建立 mysql2 Pool 連線池並導出 Promise 抽象層
├── controllers/             # 🧠 業務邏輯大腦區 (Controllers)
│   ├── orderController.js   #    - 處理訂單核心業務、呼拓預存程序 (Stored Procedure)
│   └── productController.js #    - 處理多條件商品篩選、跨表 JOIN 商家數據
├── routes/                  # 🛣️ 交通總機/路由分派區 (Routes)
│   ├── orderRoutes.js       #    - 負責定義 /api/orders/* 端點的去向
│   └── productRoutes.js     #    - 負責定義 /api/products/* 端點的去向
├── .env                     # 🔐 地端私密環境變數 (存放真實憑證，嚴禁推上 GitHub)
├── package.json             # 📦 專案相依套件與啟動腳本清單 (NPM Scripts)
└── server.js                # 🚀 伺服器總入口 (初始化 Middleware、監聽全網卡 Port)









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
