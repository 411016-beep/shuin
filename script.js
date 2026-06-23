// ========================
// 全局變數
// ========================

// 靜態寫死範例：卡片背面會顯示固定的 TWD 匯率
const DEFAULT_CARDS = [
    { currency: 'EUR', rateTWD: '34.20', analysis: '歐元匯率卡片' },
    { currency: 'GBP', rateTWD: '42.10', analysis: '英鎊匯率卡片' },
    { currency: 'AUD', rateTWD: '21.50', analysis: '澳幣匯率卡片' },
    { currency: 'JPY', rateTWD: '0.22', analysis: '日圓匯率卡片' },
    { currency: 'USD', rateTWD: '31.50', analysis: '美元匯率卡片' }
];

// 如果你要改成手動寫死更多匯率，直接修改 DEFAULT_CARDS 中的 rateTWD 值即可。


let cards = [];
let currentIndex = 0;
const STORAGE_KEY = 'currencyCards';

// GAS 部署網址（如需部署請改為實際網址）
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzJ6cXjMKZj47W6Jic0itnBFz3WYBAZW1oEjoYXdW7p7rq2V5ANpelI6qro8oczOgfn/exec';

// DOM 元素（會在不同頁面初始化）
let card, cardWrapper, currencyCode, rateToTWD, analysisText, cardIndicator, prevBtn, nextBtn;
let baseCurrency, customCurrency, rateToTWDInput, analysisTextarea, saveBtn, savedCardsList, cardCount;
let navBtns, pages, addCardBtn;

// ========================
// 初始化
// ========================

document.addEventListener('DOMContentLoaded', () => {
    loadCards();

    // 若在首頁（有 #card 元素），初始化首頁相關功能
    if (document.getElementById('card')) {
        initMainPage();
    }

    // 若在管理頁（有 #management-page 或 savedCardsList），初始化管理頁功能
    if (document.getElementById('management-page') || document.getElementById('savedCardsList')) {
        initManagementPage();
    }
});

// ========================
// 事件監聽器
// ========================

function initMainPage() {
    // 元素綁定（首頁）
    card = document.getElementById('card');
    cardWrapper = document.getElementById('cardWrapper');
    currencyCode = document.getElementById('currencyCode');
    rateToTWD = document.getElementById('rateToTWD');
    analysisText = document.getElementById('analysisText');
    cardIndicator = document.getElementById('cardIndicator');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    addCardBtn = document.getElementById('addCardBtn');

    attachMainEventListeners();
    // 若有 currency query param，選中對應卡片
    const params = new URLSearchParams(window.location.search);
    const currencyParam = params.get('currency');
    if (currencyParam) {
        const idx = cards.findIndex(c => c.currency === currencyParam.toUpperCase());
        if (idx !== -1) currentIndex = idx;
        history.replaceState(null, '', window.location.pathname);
    }

    renderCard();
}

function attachMainEventListeners() {
    if (cardWrapper) cardWrapper.addEventListener('click', toggleCardFlip);
    if (prevBtn) prevBtn.addEventListener('click', previousCard);
    if (nextBtn) nextBtn.addEventListener('click', nextCard);
    if (addCardBtn) addCardBtn.addEventListener('click', () => { window.location.href = 'management.html'; });
}

function initManagementPage() {
    baseCurrency = document.getElementById('baseCurrency');
    customCurrency = document.getElementById('customCurrency');
    rateToTWDInput = document.getElementById('rateToTWDInput');
    analysisTextarea = document.getElementById('analysisTextarea');
    saveBtn = document.getElementById('saveBtn');
    savedCardsList = document.getElementById('savedCardsList');
    cardCount = document.getElementById('cardCount');

    attachManagementEventListeners();
    renderSavedCards();
}

function attachManagementEventListeners() {
    if (saveBtn) saveBtn.addEventListener('click', saveCurrencyCard);
    const autoFillBtn = document.getElementById('autoFillBtn');
    if (autoFillBtn) autoFillBtn.addEventListener('click', autoFillCurrencyData);
    if (baseCurrency) baseCurrency.addEventListener('change', handleCurrencySelection);
    if (customCurrency) customCurrency.addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase(); });
}

// ========================
// 卡片翻轉功能
// ========================

function toggleCardFlip() {
    card.classList.toggle('flipped');
}

function resetCardToFront() {
    card.classList.remove('flipped');
}

// ========================
// 卡片導航
// ========================

function previousCard() {
    if (currentIndex > 0) {
        currentIndex--;
        resetCardToFront();
        renderCard();
    }
}

function nextCard() {
    if (currentIndex < cards.length - 1) {
        currentIndex++;
        resetCardToFront();
        renderCard();
    }
}

// ========================
// 渲染卡片
// ========================

function renderCard() {
    if (!currencyCode || !rateToTWD || !analysisText || !cardIndicator) return;

    if (cards.length === 0) {
        currencyCode.textContent = 'USD';
        rateToTWD.textContent = '-';
        analysisText.textContent = '-';
        cardIndicator.textContent = '0 / 0';
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
    }

    const currentCard = cards[currentIndex];
    currencyCode.textContent = currentCard.currency;
    const rateValue = Number(currentCard.rateTWD);
    rateToTWD.textContent = Number.isFinite(rateValue)
        ? `1 ${currentCard.currency} = ${rateValue.toFixed(2)} TWD`
        : '匯率尚未輸入';
    analysisText.textContent = currentCard.analysis || '尚無備忘錄';
    cardIndicator.textContent = `${currentIndex + 1} / ${cards.length}`;

    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === cards.length - 1;
}

// ========================
// 分頁切換
// ========================

function switchPage(pageName) {
    if (!navBtns || !pages) return;

    navBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === pageName);
    });

    pages.forEach(page => {
        page.classList.toggle('active', page.id === `${pageName}-page`);
    });

    if (pageName === 'management') {
        resetForm();
        renderSavedCards();
    }
}

// ========================
// 表單管理
// ========================

function resetForm() {
    if (!baseCurrency || !customCurrency || !rateToTWDInput || !analysisTextarea) return;
    baseCurrency.value = '';
    customCurrency.value = '';
    customCurrency.classList.add('hidden');
    rateToTWDInput.value = '';
    analysisTextarea.value = '';
}

// ========================
// 自動填入功能
// ========================

function getSelectedCurrency() {
    if (baseCurrency.value === 'other') {
        return customCurrency.value.trim().toUpperCase();
    }
    return baseCurrency.value;
}

function handleCurrencySelection() {
    if (baseCurrency.value === 'other') {
        customCurrency.classList.remove('hidden');
        customCurrency.focus();
    } else {
        customCurrency.classList.add('hidden');
        customCurrency.value = '';
    }
}

async function autoFillCurrencyData() {
    const currency = getSelectedCurrency();

    if (!currency || currency.length !== 3) {
        showMessage('請選擇或輸入有效的幣別代碼（3 個字母）', 'error');
        return;
    }

    try {
        // 即時匯率 API 範例：exchangerate.host
        const response = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=TWD`);
        const data = await response.json();

        if (!data || !data.rates) {
            throw new Error('無法取得匯率資料');
        }

        const rateTWD = data.rates.TWD ? data.rates.TWD.toFixed(2) : '';
        const today = new Date();
        const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

        rateToTWDInput.value = rateTWD;
        analysisTextarea.value = `${dateStr} 自動填入匯率：${currency} 對 TWD ${rateTWD}`;
        showMessage(`已自動填入 ${currency} 匯率`, 'success');
    } catch (error) {
        showMessage(`自動填入失敗：${error.message}`, 'error');
    }
}

// 如果你想要單獨取即時匯率並顯示在頁面上，可以用下面的函式：
// async function fetchRateToTWD(currency) {
//     const response = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=TWD`);
//     const data = await response.json();
//     return data?.rates?.TWD ? data.rates.TWD.toFixed(2) : null;
// }
//
// 使用方式：
// const liveRate = await fetchRateToTWD('AUD');
// console.log(`1 AUD = ${liveRate} TWD`);

// ========================
// 儲存卡片
// ========================

function saveCurrencyCard() {
    const currency = getSelectedCurrency();
    const rawRateTWD = rateToTWDInput.value.trim();
    const analysis = analysisTextarea.value.trim();

    if (!currency || currency.length !== 3) {
        showMessage('請選擇或輸入有效的幣別代碼（3 個字母）', 'error');
        return;
    }

    const parsedRate = parseFloat(rawRateTWD);
    if (isNaN(parsedRate) || parsedRate <= 0) {
        showMessage('請填入有效的對新台幣匯率數值', 'error');
        return;
    }

    if (!analysis) {
        showMessage('請填入備忘錄', 'error');
        return;
    }

    const rateTWD = parsedRate.toFixed(2);
    const existingIndex = cards.findIndex(card => card.currency === currency);

    if (existingIndex !== -1) {
        cards[existingIndex] = { currency, rateTWD, analysis };
        showMessage(`已更新 ${currency} 卡片`, 'success');
    } else {
        cards.push({ currency, rateTWD, analysis });
        showMessage(`已新增 ${currency} 卡片`, 'success');
    }

    cards.sort((a, b) => a.currency.localeCompare(b.currency));

    saveCards();
    sendToGAS();
    resetForm();
    renderSavedCards();
    currentIndex = cards.findIndex(card => card.currency === currency);
    renderCard();
}

// ========================
// 刪除卡片
// ========================

function deleteCard(currency) {
    if (confirm(`確定要刪除 ${currency} 卡片嗎？`)) {
        cards = cards.filter(card => card.currency !== currency);
        saveCards();
        sendToGAS();
        renderSavedCards();

        if (currentIndex >= cards.length) {
            currentIndex = Math.max(0, cards.length - 1);
        }
        renderCard();

        showMessage(`已刪除 ${currency} 卡片`, 'success');
    }
}

// ========================
// 已存卡片列表渲染
// ========================

function selectCard(currency) {
    const index = cards.findIndex(card => card.currency === currency);
    if (index === -1) return;

    // 如果在首頁直接選擇，否則從管理頁導回首頁並附帶 query
    if (document.getElementById('card')) {
        currentIndex = index;
        resetCardToFront();
        renderCard();
    } else {
        window.location.href = `index.html?currency=${encodeURIComponent(currency)}`;
    }
}

function renderSavedCards() {
    if (!savedCardsList || !cardCount) return;
    savedCardsList.innerHTML = '';
    cardCount.textContent = cards.length;

    if (cards.length === 0) {
        savedCardsList.innerHTML = '<p style="color: var(--text-light); text-align: center;">尚無已存卡片</p>';
        return;
    }

    cards.forEach(cardData => {
        const cardElement = document.createElement('div');
        cardElement.className = 'saved-card-item';
        cardElement.innerHTML = `
            <div class="saved-card-info" onclick="selectCard('${cardData.currency}')">
                <div class="saved-card-currency">${cardData.currency}</div>
                <div class="saved-card-rates">
                    TWD: ${cardData.rateTWD}
                </div>
            </div>
            <div class="saved-card-actions">
                <button class="saved-card-view" onclick="selectCard('${cardData.currency}')">查看</button>
                <button class="saved-card-delete" onclick="deleteCard('${cardData.currency}')">刪除</button>
            </div>
        `;
        savedCardsList.appendChild(cardElement);
    });
}

// ========================
// 與 GAS 同步
// ========================

async function sendToGAS() {
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'saveCards',
                cards: cards
            })
        });

        if (response.ok) {
            console.log('卡片已同步至試算表');
        }
    } catch (error) {
        console.warn('GAS 同步失敗（本地已保存）:', error);
    }
}

// ========================
// LocalStorage 操作
// ========================

function loadCards() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            cards = JSON.parse(stored).map(card => {
                const currency = card.currency || '';
                const rawRate = card.rateTWD;
                const hasValidRate = rawRate !== null && rawRate !== undefined && rawRate !== '' && rawRate !== '-';
                const defaultRate = DEFAULT_CARDS.find(d => d.currency === currency)?.rateTWD || '-';

                return {
                    currency: currency,
                    rateTWD: hasValidRate ? String(rawRate) : defaultRate,
                    analysis: card.analysis || ''
                };
            });
        } catch (error) {
            console.error('Failed to parse stored cards:', error);
            cards = [];
        }
    }

    if (cards.length === 0) {
        cards = [...DEFAULT_CARDS];
        saveCards();
    }
}

function saveCards() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

// ========================
// 消息提示
// ========================

function showMessage(text, type = 'success') {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 3000);
}
