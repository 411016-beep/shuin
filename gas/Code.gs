// ========================
// Google Apps Script 後端
// ========================
// 將此程式碼複製至 Google Apps Script 編輯器
// 部署為「新建部署」→「類型：網路應用程式」

// 試算表 ID（需要替換為實際的試算表 ID）
const SPREADSHEET_ID = '1QDrYRtYLo6nQ-3UWLyQjQfyJBsT40jTpemGkoG2mSHQ';
const SHEET_NAME = '匯率卡片';

/**
 * 處理 POST 請求 - 接收前端傳來的卡片資料
 */
function doPost(e) {
  try {
    // 解析請求資料
    const payload = JSON.parse(e.postData.contents);
    
    if (payload.action === 'saveCards') {
      saveCardsToSheet(payload.cards);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: '卡片已保存至試算表'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: '未知的操作'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 將卡片資料保存到試算表
 */
function saveCardsToSheet(cards) {
  const sheet = getOrCreateSheet();
  
  // 清空現有資料（保留標題列）
  const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4);
  dataRange.clearContent();
  
  // 寫入新資料
  const data = cards.map(card => [
    card.currency,
    card.rateTWD,
    card.rateJPY,
    card.analysis
  ]);
  
  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, 4).setValues(data);
  }
  
  // 記錄最後更新時間
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logSheet = ss.getSheetByName('更新日誌') || ss.insertSheet('更新日誌');
  logSheet.appendRow([new Date(), `保存了 ${cards.length} 張卡片`]);
}

/**
 * 取得或建立工作表
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // 設定標題列
    sheet.getRange(1, 1, 1, 4).setValues([['幣別', '對台幣匯率', '對日圓匯率', '備忘錄']]);
  }
  
  return sheet;
}

/**
 * 測試函數 - 用於手動測試
 */
function test() {
  const testCards = [
    {
      currency: 'USD',
      rateTWD: '31.50',
      rateJPY: '150.25',
      analysis: '美元走勢穩定'
    },
    {
      currency: 'EUR',
      rateTWD: '34.20',
      rateJPY: '165.30',
      analysis: '歐元小幅上升'
    }
  ];
  
  saveCardsToSheet(testCards);
  Logger.log('測試完成');
}
