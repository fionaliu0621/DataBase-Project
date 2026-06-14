# DataBase-Project

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