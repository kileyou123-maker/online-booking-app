/**
 * booking.js
 * 小型企業網站 MVP：客戶線上預約邏輯
 */

// 1. 狀態與數據管理
let currentStep = 1;
let selectedServiceDuration = 0;
let selectedDate = '';
let selectedTime = '';
let selectedSlotElement = null;

// 靜態可用時段資料 (模擬行事曆 API 回傳)
const availableSlots = {
    // 格式: 'YYYY-MM-DD': ['HH:MM', 'HH:MM', ...]
    '2025-12-10': ['10:00', '11:30', '14:00', '15:30'],
    '2025-12-11': ['09:00', '11:00', '13:00', '14:30'],
    '2025-12-12': ['10:30', '12:00', '16:00'],
    '2025-12-13': ['10:00', '14:00', '15:30'],
    '2025-12-14': ['11:00', '15:00'],
};

/**
 * 步驟切換函數
 * @param {number} step - 欲切換的步驟編號 (1, 2, 或 3)
 */
function nextStep(step) {
    const serviceSelect = document.getElementById('service-select');

    // 步驟檢查與數據傳遞
    if (step === 2) {
        const duration = parseInt(serviceSelect.value);
        if (!duration) {
            alert("請先選擇服務項目！");
            return;
        }
        selectedServiceDuration = duration;
        document.getElementById('duration-display').textContent = duration;
        initDateSelect(); 
    }
    
    if (step === 3) {
        if (!selectedDate || !selectedTime) {
            alert("請選擇日期和時間！");
            return;
        }
        document.getElementById('summary-service').textContent = serviceSelect.options[serviceSelect.selectedIndex].text;
        document.getElementById('summary-datetime').textContent = `${selectedDate} ${selectedTime}`;
    }

    // 更新介面
    document.getElementById(`step${currentStep}`).style.display = 'none';
    document.getElementById(`step${currentStep}-indicator`).classList.remove('active');
    
    currentStep = step;
    
    document.getElementById(`step${currentStep}`).style.display = 'block';
    document.getElementById(`step${currentStep}-indicator`).classList.add('active');
}

/**
 * 初始化日期下拉選單
 */
function initDateSelect() {
    const dateSelect = document.getElementById('date-select');
    // 僅在第一次載入時清空，避免重複添加
    if (dateSelect.options.length <= 1) { 
        dateSelect.innerHTML = '<option value="">-- 請選擇日期 --</option>';
    }
    
    // 將可用時段的日期添加到下拉選單
    Object.keys(availableSlots).sort().forEach(date => {
        // 避免重複添加，如果已經有選項則跳過 (適用於實際的動態日曆)
        let optionExists = Array.from(dateSelect.options).some(option => option.value === date);
        if (!optionExists) {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = date;
            dateSelect.appendChild(option);
        }
    });
    // 渲染時段
    renderTimeSlots();
}

/**
 * 渲染時間時段
 */
function renderTimeSlots() {
    const dateSelect = document.getElementById('date-select');
    selectedDate = dateSelect.value;
    const timeSlotsContainer = document.getElementById('time-slots');
    timeSlotsContainer.innerHTML = '';
    
    // 重置已選時段
    selectedTime = '';
    selectedSlotElement = null;
    document.getElementById('confirm-time-button').disabled = true;
    
    if (!selectedDate) {
        timeSlotsContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: #999;">請先選擇一個日期。</p>';
        return;
    }

    const slots = availableSlots[selectedDate] || [];
    
    if (slots.length === 0) {
        timeSlotsContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: #999;">該日期沒有可用時段。</p>';
        return;
    }

    slots.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = time;
        
        // MVP 簡化：將所有時段視為可用
        slot.addEventListener('click', () => selectTimeSlot(slot, time));
        timeSlotsContainer.appendChild(slot);
    });
}

/**
 * 選擇時間時段的點擊處理
 */
function selectTimeSlot(element, time) {
    if (element.classList.contains('unavailable')) return;
    
    // 清除前一個選定的時段
    if (selectedSlotElement) {
        selectedSlotElement.classList.remove('selected');
    }
    
    // 設定新的選定時段
    element.classList.add('selected');
    selectedSlotElement = element;
    selectedTime = time;
    document.getElementById('confirm-time-button').disabled = false;
}

/**
 * 提交預約 (MVP 模擬)
 */
function submitBooking() {
    const name = document.getElementById('client-name').value;
    const email = document.getElementById('client-email').value;
    const service = document.getElementById('summary-service').textContent;
    const datetime = document.getElementById('summary-datetime').textContent;

    if (!name || !email) {
        alert("請填寫您的姓名和 Email！");
        return;
    }
    
    // *** MVP 模擬預約成功並儲存到 localStorage ***
    const bookingDetails = {
        name,
        email,
        service,
        datetime,
        status: 'Confirmed',
        timestamp: new Date().toISOString()
    };
    
    // 模擬存入數據庫 (在瀏覽器儲存)
    let bookings = JSON.parse(localStorage.getItem('clientBookings') || '[]');
    bookings.push(bookingDetails);
    localStorage.setItem('clientBookings', JSON.stringify(bookings));

    // 彈窗確認
    alert(`🎉 預約成功！\n\n服務: ${service}\n時間: ${datetime}\n\n企業主將在稍後與您聯繫確認。`);
    
    // 導向感謝頁面或清空表單
    window.location.reload(); 
}

// 首次載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    // 確保只在步驟 1 顯示，並初始化其他步驟
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
});