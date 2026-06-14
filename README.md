# DataBase-Project

## backend
* 跟之前的電影網頁一樣，資料夾存在xampp，開apache

* mysql workbench 連老師的機器，執行data/db_data.sql，載入一點點測試資料，更完整的資料可以再整理，或是直接用寫好的介面加入資料

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