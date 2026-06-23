// ========================
// 全局變數
// ========================

const DEFAULT_CARDS = [
    { currency: 'EUR', rateTWD: '-', analysis: '歐元匯率卡片' },
    { currency: 'GBP', rateTWD: '-', analysis: '英鎊匯率卡片' },
    { currency: 'AUD', rateTWD: '-', analysis: '澳幣匯率卡片' },
    { currency: 'JPY', rateTWD: '-', analysis: '日圓匯率卡片' },
    { currency: 'USD', rateTWD: '-', analysis: '美元匯率卡片' }
];

let cards = [];
let currentIndex = 0;
const STORAGE_KEY = 'currencyCards';

// GAS 部署網址
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzJ6cXjMKZj47W6Jic0itnBFz3WYBAZW1oEjoYXdW7p7rq2V5ANpelI6qro8oczOgfn/exec';

// ========================
// DOM 元素引用
// ========================

const card = document.getElementById('card');
const cardWrapper = document.getElementById('cardWrapper');
const currencyCode = document.getElementById('currencyCode');
const rateToTWD = document.getElementById('rateToTWD');
const analysisText = document.getElementById('analysisText');
const cardIndicator = document.getElementById('cardIndicator');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const baseCurrency = document.getElementById('baseCurrency');
const customCurrency = document.getElementById('customCurrency');
const rateToTWDInput = document.getElementById('rateToTWDInput');
const analysisTextarea = document.getElementById('analysisTextarea');
const saveBtn = document.getElementById('saveBtn');
const savedCardsList = document.getElementById('savedCardsList');
const cardCount = document.getElementById('cardCount');

const navBtns = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

// ========================
// 初始化
// ========================

document.addEventListener('DOMContentLoaded', () => {
    loadCards();
    renderCard();
    attachEventListeners();
    renderSavedCards();
});

// ========================
// 事件監聽器
// ========================

function attachEventListeners() {
    // 卡片翻轉
    cardWrapper.addEventListener('click', toggleCardFlip);

    // 導航按鈕
    prevBtn.addEventListener('click', previousCard);
    nextBtn.addEventListener('click', nextCard);

    // 分頁切換
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => switchPage(btn.dataset.page));
    });

    // 管理頁面功能
    saveBtn.addEventListener('click', saveCurrencyCard);
    document.getElementById('autoFillBtn').addEventListener('click', autoFillCurrencyData);
    document.getElementById('addCardBtn').addEventListener('click', () => switchPage('management'));
    baseCurrency.addEventListener('change', handleCurrencySelection);
    customCurrency.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });
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
    if (cards.length === 0) {
        currencyCode.textContent = 'USD';
        rateToTWD.textContent = '-';
        analysisText.textContent = '-';
        cardIndicator.textContent = '0 / 0';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    const currentCard = cards[currentIndex];
    currencyCode.textContent = currentCard.currency;
    rateToTWD.textContent = currentCard.rateTWD && currentCard.rateTWD !== '-'
        ? `1 ${currentCard.currency} = ${currentCard.rateTWD} TWD`
        : '-';
    analysisText.textContent = currentCard.analysis;
    cardIndicator.textContent = `${currentIndex + 1} / ${cards.length}`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === cards.length - 1;
}

// ========================
// 分頁切換
// ========================

function switchPage(pageName) {
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

// ========================
// 儲存卡片
// ========================

function saveCurrencyCard() {
    const currency = getSelectedCurrency();
    const rateTWD = rateToTWDInput.value.trim();
    const analysis = analysisTextarea.value.trim();

    if (!currency || currency.length !== 3) {
        showMessage('請選擇或輸入有效的幣別代碼（3 個字母）', 'error');
        return;
    }

    if (!rateTWD) {
        showMessage('請填入對新台幣的匯率', 'error');
        return;
    }

    if (!analysis) {
        showMessage('請填入備忘錄', 'error');
        return;
    }

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

function renderSavedCards() {
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
            <div class="saved-card-info">
                <div class="saved-card-currency">${cardData.currency}</div>
                <div class="saved-card-rates">
                    TWD: ${cardData.rateTWD}
                </div>
            </div>
            <button class="saved-card-delete" onclick="deleteCard('${cardData.currency}')">刪除</button>
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
            cards = JSON.parse(stored);
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
