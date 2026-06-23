# 外幣追蹤卡片 - 部署與使用指南

## 📋 目錄
1. [快速開始](#快速開始)
2. [前端設置](#前端設置)
3. [Google Apps Script 後端部署](#google-apps-script-後端部署)
4. [連接前端與後端](#連接前端與後端)
5. [功能說明](#功能說明)
6. [故障排除](#故障排除)

---

## 快速開始

### 所需工具
- 網頁瀏覽器（Chrome、Firefox、Safari 等）
- Google 帳戶
- 任何文字編輯器

### 項目結構
```
shuin/
├── index.html           # 前端頁面
├── styles.css           # 樣式表
├── script.js            # 前端邏輯
├── gas/
│   └── Code.gs         # Google Apps Script 後端
├── SETUP.md            # 本文件
└── README.md
```

---

## 前端設置

### 1. 本地測試（無 GAS）
直接在瀏覽器打開 `index.html` 即可使用，所有資料保存在本地瀏覽器的 `localStorage` 中。

**優點：** 無需配置，立即使用
**缺點：** 資料只在本機保存，換電腦會遺失

```bash
# macOS/Linux - 用本機伺服器打開
python3 -m http.server 8000

# 然後在瀏覽器訪問
http://localhost:8000
```

### 2. 部署到網路
#### 選項 A：GitHub Pages（推薦簡單用戶）
1. 將此倉庫 fork 到你的 GitHub 帳戶
2. 進入 Settings → Pages
3. 選擇 `Branch: main` → 保存
4. 幾分鐘後即可訪問 `https://your-username.github.io/shuin`

#### 選項 B：Netlify（推薦有域名的用戶）
1. 將代碼推送到 GitHub
2. 訪問 [Netlify](https://netlify.com)
3. 點擊「New site from Git」
4. 連接 GitHub 倉庫，點擊「Deploy」

---

## Google Apps Script 後端部署

### 第 1 步：建立 Google 試算表

1. 打開 [Google Drive](https://drive.google.com)
2. 點擊「新建」→「Google 試算表」
3. 命名為「Shuin 匯率卡片」
4. 複製試算表的 **ID**（URL 中 `/d/` 後面的長字符串）

**URL 示例：**
```
https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J/edit
                                        ^^^^^^^^^^^^^^^^^^^^^^
                                        這是試算表 ID
```

### 第 2 步：建立 Google Apps Script 專案

1. 在試算表中點擊「擴充功能」→「Apps Script」
2. 刪除預設程式碼
3. 複製 `gas/Code.gs` 中的所有程式碼到編輯器
4. **替換第 4 行的 SPREADSHEET_ID：**
   ```javascript
   const SPREADSHEET_ID = '1A2B3C4D5E6F7G8H9I0J'; // 替換為你的試算表 ID
   ```
5. 按 `Ctrl+S`（或 `Cmd+S`）保存

### 第 3 步：設定授權

1. 點擊「執行」按鈕，選擇 `test` 函數
2. 瀏覽器會要求授權，點擊「授權」
3. 選擇你的 Google 帳戶
4. 點擊「允許此應用程式存取你的資料」

### 第 4 步：部署為網路應用程式

1. 在 Apps Script 編輯器中，點擊「部署」（或「新建部署」）
2. 選擇「類型」→「網路應用程式」
3. **設定以下值：**
   - 執行方式：「我」
   - 存取權限：「任何人」（允許前端呼叫）
4. 點擊「部署」
5. 複製網路應用程式的 **URL**（看起來像 `https://script.google.com/macros/d/...`）

⚠️ **重要：保存此 URL！**

---

## 連接前端與後端

### 更新 script.js

在 `script.js` 中找到第 8 行：

```javascript
const GAS_URL = 'https://script.google.com/macros/d/{SCRIPT_ID}/usercontent';
```

**替換為：**
```javascript
const GAS_URL = 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercontent';
```

其中 `YOUR_DEPLOYMENT_ID` 是步驟 4 中複製的 URL 中的 ID。

**完整示例：**
```javascript
// 原始 URL:
// https://script.google.com/macros/d/1A2B3C4D5E6F7G8H9I0J/usercontent

const GAS_URL = 'https://script.google.com/macros/d/1A2B3C4D5E6F7G8H9I0J/usercontent';
```

### 驗證連接

1. 在瀏覽器打開 `index.html`
2. 進入「管理」頁面
3. 新增一張卡片並點擊「儲存卡片」
4. 如果成功，頁面會顯示「已新增 XXX 卡片」
5. 打開 Google 試算表，檢查資料是否出現在「匯率卡片」工作表中

✅ **如果試算表有資料，表示連接成功！**

---

## 功能說明

### 🏠 首頁
- **卡片顯示：** 中央白色卡片展示貨幣代碼（正面）
- **3D 翻轉：** 點擊卡片即可翻轉，查看匯率與備忘錄
- **導航控制：** 使用「← 上一張」和「下一張 →」切換卡片

### ⚙️ 管理頁面
- **新增卡片：** 輸入幣別代碼、匯率和備忘錄
- **儲存方式：**
  - 本地 `localStorage`（立即保存）
  - Google 試算表（自動同步）
- **編輯卡片：** 輸入相同的幣別代碼並保存即可覆蓋
- **刪除卡片：** 在「已存卡片列表」中點擊「刪除」按鈕
- **卡片統計：** 顯示目前已存卡片總數

### 💾 數據同步
- **優先級：** 本地 `localStorage` > Google 試算表
- **自動同步：** 每次保存/刪除卡片時自動發送到 GAS
- **離線模式：** 如果 GAS 連接失敗，資料仍會保存在本地
- **初始化：** 重整頁面時自動從 `localStorage` 恢復資料

---

## 故障排除

### ❌ 問題 1：保存卡片時收到錯誤訊息

**原因：** GAS URL 未正確設定

**解決方案：**
1. 檢查 `script.js` 第 8 行的 `GAS_URL` 是否正確
2. 打開瀏覽器開發者工具（F12 或 Cmd+Option+I）
3. 查看「Console」標籤，尋找錯誤訊息
4. 複製完整的 GAS URL 並重試

### ❌ 問題 2：試算表沒有出現新工作表

**原因：** 可能是 SPREADSHEET_ID 錯誤或授權問題

**解決方案：**
1. 確認 `gas/Code.gs` 中的 SPREADSHEET_ID 正確
2. 在 Apps Script 編輯器中再次執行 `test` 函數
3. 檢查試算表是否有「匯率卡片」和「更新日誌」工作表

### ❌ 問題 3：瀏覽器顯示「CORS 錯誤」

**原因：** 通常是 GAS 部署配置問題

**解決方案：**
1. 刪除舊部署，建立新部署
2. 確保「存取權限」設定為「任何人」
3. 等待幾分鐘讓部署完全生效

### ❌ 問題 4：刷新頁面後資料消失

**原因：** 本地 `localStorage` 被清除或瀏覽器設定問題

**解決方案：**
1. 檢查瀏覽器是否開啟了「隱私/無痕模式」（會導致無法保存資料）
2. 在正常模式下重新新增卡片
3. 檢查 Google 試算表中的資料是否仍存在

---

## 常見問題 (FAQ)

### Q1：是否需要 API Key？
**答：** 不需要。此應用完全使用原生 GAS，無需任何第三方 API 或金鑰。

### Q2：能否在多個裝置間同步資料？
**答：** 可以。只要使用同一個 Google 帳戶，所有裝置都會通過 Google 試算表自動同步。

### Q3：是否可以離線使用？
**答：** 可以。前端完全基於本地 `localStorage`，即使 GAS 連接失敗也能正常使用。

### Q4：如何備份數據？
**答：** 
1. 打開 Google 試算表
2. 點擊「檔案」→「下載」→「Excel 格式 (.xlsx)」

### Q5：可以自訂試算表結構嗎？
**答：** 可以。修改 `gas/Code.gs` 中的 `SHEET_NAME` 和欄位即可。

---

## 技術棧

| 組件 | 技術 | 說明 |
|------|------|------|
| 前端 | HTML5 + CSS3 + ES6+ | 零框架、零依賴 |
| 3D 效果 | CSS `perspective` + `backface-visibility` | 瀏覽器硬體加速 |
| API 呼叫 | 原生 `fetch()` | 無第三方 HTTP 庫 |
| 本地存儲 | `localStorage` | 瀏覽器內建 |
| 後端 | Google Apps Script | 無需伺服器 |
| 數據庫 | Google 試算表 | 無需配置 SQL |

---

## 開發提示

### 本地測試 GAS

在 Apps Script 編輯器中執行 `test()` 函數：
1. 點擊「執行」
2. 選擇 `test` 函數
3. 查看「執行日誌」確認是否成功

### 查看請求日誌

在 Apps Script 編輯器點擊「執行日誌」查看所有請求記錄。

### 修改試算表格式

在 `saveCardsToSheet()` 函數中修改列定義：
```javascript
const data = cards.map(card => [
  card.currency,           // A 欄
  card.rateTWD,           // B 欄
  card.rateJPY,           // C 欄
  card.analysis,          // D 欄
  new Date().toLocaleString() // 可以添加時間戳
]);
```

---

## 安全性注意

✅ **此應用的安全特性：**
- 無 API Key，無金鑰外洩風險
- 所有 Google API 認證由 Google 帳戶系統管理
- 資料存儲在用戶自己的 Google 帳戶中
- 無第三方服務、無數據追蹤

---

## 更新日誌

### v1.0 (2024)
- ✅ 3D 卡片翻轉功能
- ✅ 本地 localStorage 存儲
- ✅ Google Apps Script 後端
- ✅ 自動同步至試算表
- ✅ 零框架、零依賴

---

## 支持與反饋

如有問題或建議，請提出 Issue 或 Pull Request。

---

**祝使用愉快！** 🎉
