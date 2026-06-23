# 外幣追蹤卡片 (Shuin)

一個極簡的網頁應用，用於追蹤與管理多種外幣的匯率與分析備忘錄。

## 🎯 核心特性

- **3D 卡片翻轉：** 使用 CSS3 透視效果，無需任何 JavaScript 動畫庫
- **極簡技術棧：** 純原生 HTML5 + CSS3 + JavaScript，零框架、零依賴
- **本地優先：** 使用瀏覽器 `localStorage` 立即保存資料
- **GAS 同步：** 可選的 Google Apps Script 後端，資料自動同步至試算表
- **無需 API Key：** 完全避免環境變數、密鑰外洩等安全問題

## 🚀 快速開始

### 1. 本地使用（無後端）
直接在瀏覽器打開 `index.html`，所有資料保存在本地。

```bash
# 用本機伺服器打開
python3 -m http.server 8000
# 訪問 http://localhost:8000
```

### 2. 完整部署（含 GAS 同步）
詳見 **[SETUP.md](SETUP.md)** 的完整部署指南。

## 📁 項目結構

```
shuin/
├── index.html          # 前端頁面結構
├── styles.css          # 樣式與動畫（3D 翻轉效果）
├── script.js           # 核心邏輯（卡片管理、localStorage）
├── gas/
│   └── Code.gs         # Google Apps Script 後端
├── SETUP.md            # 詳細部署與使用指南
└── README.md           # 本文件
```

## 🎨 界面說明

### 首頁 (Main Page)
- 中央白色卡片，正面顯示幣別代碼
- 點擊翻轉查看匯率與備忘錄
- 下方控制列可切換不同卡片

### 管理頁面 (Management)
- 新增/編輯幣別卡片
- 輸入對台幣、對日圓的匯率
- 添加個人備忘錄或市場分析
- 查看已存卡片列表

## ⚙️ 功能清單

| 功能 | 實現方式 |
|------|---------|
| 3D 卡片翻轉 | CSS `transform: rotateY()` + `perspective` |
| 數據存儲 | 瀏覽器 `localStorage` |
| 遠程同步 | Google Apps Script (可選) |
| 無框架 | 純原生 JavaScript (ES6+) |
| 無依賴 | 零 npm 套件 |

## 🔗 連接方式

### 前端 → 後端
使用原生 `fetch()` POST 請求到 GAS：

```javascript
fetch(GAS_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'saveCards', cards: cardsData })
})
```

### 後端 → 試算表
GAS 接收前端數據並寫入 Google 試算表：

```javascript
// gas/Code.gs
function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  saveCardsToSheet(payload.cards);
  // 返回成功訊息
}
```

## 📝 使用步驟

### 步驟 1：新增卡片
1. 進入「管理」頁面
2. 輸入幣別代碼（例：EUR）
3. 填入對台幣匯率和對日圓匯率
4. 添加備忘錄
5. 點擊「儲存卡片」

### 步驟 2：瀏覽卡片
1. 返回「首頁」
2. 點擊中央卡片翻轉查看詳細資訊
3. 使用「← 上一張 / 下一張 →」切換不同卡片

### 步驟 3：編輯或刪除
- **編輯：** 輸入相同幣別代碼並保存即可覆蓋
- **刪除：** 在管理頁面點擊「刪除」按鈕

## 🛠️ 技術棧

```
前端層：HTML5 + CSS3 + ES6+ JavaScript
  ├─ CSS Perspective 3D 效果（無 Three.js）
  ├─ 原生 fetch() API（無 Axios）
  └─ localStorage 本地存儲（無 IndexedDB）

後端層（可選）：Google Apps Script
  ├─ doPost(e) 接收 POST 請求
  ├─ Google Sheets API 讀寫試算表
  └─ 無需伺服器、無需環境變數
```

## 📊 數據結構

每張卡片包含：
```javascript
{
  currency: "USD",           // 幣別代碼
  rateTWD: "31.50",         // 對台幣匯率
  rateJPY: "150.25",        // 對日圓匯率
  analysis: "美元走勢穩定"   // 備忘錄
}
```

## 🔒 安全性

✅ **無 API Key**
✅ **無環境變數**
✅ **無第三方服務**
✅ **數據存儲在用戶的 Google 帳戶**
✅ **本地優先，離線也能使用**

## 📚 詳細文檔

- **[SETUP.md](SETUP.md)** - 完整部署指南（Google Apps Script 配置、GAS URL 設定等）
- **[開發提示](#開發提示)** - 本地測試、日誌查看等

## 🎓 開發提示

### 本地測試
```bash
# 啟動本地伺服器
python3 -m http.server 8000

# 或使用 Node.js
npx http-server
```

### 查看浏览器控制台
按 `F12` 或 `Cmd+Option+I` 打開開發者工具，檢查 Console 標籤。

### 測試 GAS 函數
在 Apps Script 編輯器中執行 `test()` 函數，查看「執行日誌」。

## ❓ 常見問題

**Q: 需要後端伺服器嗎？**
A: 不需要。可以用純前端 + Google 試算表，或部署到 GitHub Pages / Netlify。

**Q: 能在多個裝置同步嗎？**
A: 可以。啟用 GAS 後端後，所有裝置通過 Google 帳戶自動同步。

**Q: 能離線使用嗎？**
A: 可以。本地 `localStorage` 保證離線時仍可使用。

**Q: 如何備份數據？**
A: 從 Google 試算表下載為 Excel 格式即可。

## 📄 許可證

MIT

---

**開始使用：** 打開 `index.html` 或按照 [SETUP.md](SETUP.md) 部署完整版本！