/**
 * 任務編輯器邏輯
 */

class QuestEditor {
    constructor() {
        this.currentQuestId = null;
        this.isAuthenticated = false;
        this.init();
    }

    /**
     * 初始化編輯器
     */
    init() {
        this.checkAuthentication();
    }

    /**
     * 檢查認證
     */
    checkAuthentication() {
        if (storage.isEditorAuthenticated()) {
            this.isAuthenticated = true;
            this.setupUI();
        } else {
            this.showAuthModal();
        }
    }

    /**
     * 顯示認證模態框
     */
    showAuthModal() {
        const modal = document.getElementById('authModal');
        const authBtn = document.getElementById('authBtn');
        const authCancelBtn = document.getElementById('authCancelBtn');
        const passwordInput = document.getElementById('editorPassword');

        authBtn.addEventListener('click', () => {
            const password = passwordInput.value;
            if (storage.verifyEditorPassword(password)) {
                storage.setEditorAuthenticated(true);
                modal.style.display = 'none';
                this.isAuthenticated = true;
                this.setupUI();
            } else {
                alert('密碼不正確！');
                passwordInput.value = '';
            }
        });

        authCancelBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // 按 Enter 鍵提交
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                authBtn.click();
            }
        });

        modal.style.display = 'block';
    }

    /**
     * 設定 UI
     */
    setupUI() {
        this.setupEventListeners();
        this.refreshQuestList();
    }

    /**
     * 設定事件監聽
     */
    setupEventListeners() {
        // 返回按鈕
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // 新增任務按鈕
        document.getElementById('newQuestBtn').addEventListener('click', () => {
            this.createNewQuest();
        });

        // 表單按鈕
        document.getElementById('getCurrentLocation').addEventListener('click', () => {
            this.getCurrentLocation();
        });

        document.getElementById('saveBtnForm').addEventListener('click', () => {
            this.saveQuest();
        });

        document.getElementById('deleteBtn').addEventListener('click', () => {
            this.deleteCurrentQuest();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeForm();
        });

        // 位置輸入變更時更新預覽
        document.getElementById('questLat').addEventListener('change', () => {
            this.updateLocationPreview();
        });

        document.getElementById('questLng').addEventListener('change', () => {
            this.updateLocationPreview();
        });

        document.getElementById('questRadius').addEventListener('change', () => {
            this.updateLocationPreview();
        });

        // 滑塊輸入也要監聽
        document.getElementById('triggerRadius').addEventListener('input', (e) => {
            this.updateLocationPreview();
        });
    }

    /**
     * 刷新任務列表
     */
    refreshQuestList() {
        const quests = storage.getQuests();
        const questPanel = document.getElementById('questListPanel');
        questPanel.innerHTML = '';

        if (quests.length === 0) {
            questPanel.innerHTML = '<p class="empty-message">還沒有任務</p>';
            return;
        }

        quests.forEach(quest => {
            const item = document.createElement('div');
            item.className = 'quest-item';
            item.dataset.questId = quest.id;
            item.innerHTML = `
                <div class="quest-item-name">${quest.name}</div>
                <div class="quest-item-location">📍 ${quest.latitude.toFixed(4)}, ${quest.longitude.toFixed(4)}</div>
            `;
            item.addEventListener('click', () => {
                this.selectQuest(quest.id);
            });
            questPanel.appendChild(item);
        });
    }

    /**
     * 選擇任務進行編輯
     */
    selectQuest(questId) {
        const quest = storage.getQuest(questId);
        if (!quest) return;

        // 更新 UI 選擇狀態
        document.querySelectorAll('.quest-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-quest-id="${questId}"]`).classList.add('active');

        // 載入表單
        this.loadQuestForm(quest);
    }

    /**
     * 建立新任務
     */
    createNewQuest() {
        this.currentQuestId = null;
        
        // 清除所有 UI 選擇
        document.querySelectorAll('.quest-item').forEach(item => {
            item.classList.remove('active');
        });

        // 顯示表單
        this.showForm();

        // 嘗試取得當前位置
        this.getCurrentLocation();
    }

    /**
     * 載入任務表單
     */
    loadQuestForm(quest) {
        this.currentQuestId = quest.id;

        document.getElementById('questName').value = quest.name;
        document.getElementById('questDescription').value = quest.description || '';
        document.getElementById('questReward').value = quest.reward || '';
        document.getElementById('questObjective').value = quest.objective || '';
        document.getElementById('questHint').value = quest.hint || '';
        document.getElementById('questLat').value = quest.latitude;
        document.getElementById('questLng').value = quest.longitude;
        document.getElementById('questRadius').value = quest.radius || 200;

        this.showForm();
        this.updateLocationPreview();

        // 更新刪除按鈕可見性
        document.getElementById('deleteBtn').style.display = 'block';
    }

    /**
     * 顯示表單
     */
    showForm() {
        document.getElementById('editForm').style.display = 'block';
        document.getElementById('editorContent').style.display = 'none';

        // 如果是新任務，隱藏刪除按鈕
        if (!this.currentQuestId) {
            document.getElementById('deleteBtn').style.display = 'none';
        }
    }

    /**
     * 關閉表單
     */
    closeForm() {
        document.getElementById('editForm').style.display = 'none';
        document.getElementById('editorContent').style.display = 'block';
        this.currentQuestId = null;
    }

    /**
     * 取得當前位置
     */
    getCurrentLocation() {
        if (!navigator.geolocation) {
            alert('您的瀏覽器不支持位置服務');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                document.getElementById('questLat').value = latitude.toFixed(6);
                document.getElementById('questLng').value = longitude.toFixed(6);
                this.updateLocationPreview();
            },
            (error) => {
                alert('無法取得位置: ' + error.message);
            }
        );
    }

    /**
     * 更新位置預覽
     */
    updateLocationPreview() {
        const lat = parseFloat(document.getElementById('questLat').value);
        const lng = parseFloat(document.getElementById('questLng').value);
        const radius = parseInt(document.getElementById('questRadius').value);

        if (isNaN(lat) || isNaN(lng)) {
            document.getElementById('previewText').textContent = '請輸入有效的經緯度';
            return;
        }

        const preview = `
            📍 坐標: ${lat.toFixed(4)}, ${lng.toFixed(4)}<br>
            🎯 觸發範圍: ${radius} 米
        `;
        document.getElementById('previewText').innerHTML = preview;
    }

    /**
     * 保存任務
     */
    saveQuest() {
        // 驗證必填欄位
        const name = document.getElementById('questName').value.trim();
        const lat = parseFloat(document.getElementById('questLat').value);
        const lng = parseFloat(document.getElementById('questLng').value);
        const objective = document.getElementById('questObjective').value.trim();
        const radius = parseInt(document.getElementById('questRadius').value);

        if (!name) {
            alert('請輸入任務名稱');
            return;
        }

        if (isNaN(lat) || isNaN(lng)) {
            alert('請輸入有效的經緯度');
            return;
        }

        if (!objective) {
            alert('請輸入任務目標');
            return;
        }

        const questData = {
            name,
            description: document.getElementById('questDescription').value,
            reward: document.getElementById('questReward').value,
            objective,
            hint: document.getElementById('questHint').value,
            latitude: lat,
            longitude: lng,
            radius
        };

        try {
            if (this.currentQuestId) {
                // 更新現有任務
                storage.updateQuest(this.currentQuestId, questData);
                alert('✅ 任務已更新');
            } else {
                // 新增任務
                storage.addQuest(questData);
                alert('✅ 任務已創建');
            }

            this.closeForm();
            this.refreshQuestList();
        } catch (error) {
            console.error('保存任務出錯:', error);
            alert('❌ 保存任務失敗: ' + error.message);
        }
    }

    /**
     * 刪除當前任務
     */
    deleteCurrentQuest() {
        if (!this.currentQuestId) {
            alert('沒有選擇任務');
            return;
        }

        const quest = storage.getQuest(this.currentQuestId);
        if (!quest) {
            alert('任務不存在');
            return;
        }

        if (confirm(`確定要刪除任務「${quest.name}」嗎？此操作無法撤銷。`)) {
            try {
                storage.deleteQuest(this.currentQuestId);
                alert('✅ 任務已刪除');
                this.closeForm();
                this.refreshQuestList();
            } catch (error) {
                console.error('刪除任務出錯:', error);
                alert('❌ 刪除任務失敗: ' + error.message);
            }
        }
    }
}

// 在 DOM 載入完成後初始化編輯器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const editor = new QuestEditor();
    });
} else {
    const editor = new QuestEditor();
}
