/**
 * 主遊戲邏輯
 */

class Game {
    constructor() {
        this.currentQuest = null;
        this.init();
    }

    /**
     * 初始化遊戲
     */
    init() {
        this.setupEventListeners();
        this.startGame();
    }

    /**
     * 設定事件監聽
     */
    setupEventListeners() {
        // 編輯按鈕
        document.getElementById('editBtn').addEventListener('click', () => {
            this.openEditor();
        });

        // 設定按鈕
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        // 模態框關閉按鈕
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // 任務模態框操作按鈕
        document.getElementById('acceptBtn').addEventListener('click', () => {
            this.acceptQuest(this.currentQuest.id);
        });

        document.getElementById('completeBtn').addEventListener('click', () => {
            this.completeQuest(this.currentQuest.id);
        });

        document.getElementById('abandonBtn').addEventListener('click', () => {
            this.abandonQuest(this.currentQuest.id);
        });

        // 設定中的滑塊
        const radiusSlider = document.getElementById('triggerRadius');
        const intervalSlider = document.getElementById('updateInterval');

        radiusSlider.addEventListener('change', (e) => {
            storage.setTriggerRadius(parseInt(e.target.value));
        });

        intervalSlider.addEventListener('change', (e) => {
            storage.setUpdateInterval(parseInt(e.target.value));
            this.restartLocationTracking();
        });

        // 清除數據按鈕
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            if (confirm('確定要清除所有數據嗎？此操作無法撤銷。')) {
                storage.clearAll();
                location.reload();
            }
        });

        // 位置更新回調
        locationTracker.onLocationUpdate((location) => {
            this.updateLocationDisplay(location);
            this.checkNearbyQuests(location);
        });

        // 錯誤回調
        locationTracker.onError((error) => {
            this.updateLocationStatus(error);
        });

        // 外部區域點擊關閉模態框
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        });
    }

    /**
     * 開始遊戲
     */
    startGame() {
        // 初始化設定
        const settings = storage.getSettings();
        document.getElementById('triggerRadius').value = settings.triggerRadius;
        document.getElementById('updateInterval').value = settings.updateInterval;
        this.updateRadiusDisplay(settings.triggerRadius);
        this.updateIntervalDisplay(settings.updateInterval);

        // 啟動位置追蹤
        locationTracker.startTracking();

        // 初始化 UI
        this.refreshQuestLists();
    }

    /**
     * 更新位置顯示
     */
    updateLocationDisplay(location) {
        const text = `📍 ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
        document.getElementById('locationText').textContent = text;
        document.getElementById('statusText').textContent = '✅ 已獲取位置';
        
        // 顯示距離信息
        const quests = storage.getQuests();
        if (quests.length > 0) {
            let minDistance = Infinity;
            let minText = '';
            
            quests.forEach(quest => {
                const distance = locationTracker.getDistanceToQuest(quest.latitude, quest.longitude);
                if (distance < minDistance) {
                    minDistance = distance;
                    minText = locationTracker.getDistanceText(quest.latitude, quest.longitude);
                }
            });

            if (minDistance !== Infinity) {
                document.getElementById('distanceInfo').style.display = 'block';
                document.getElementById('nearestDistance').textContent = minText;
            }
        }
    }

    /**
     * 更新位置狀態
     */
    updateLocationStatus(status) {
        document.getElementById('statusText').textContent = status;
    }

    /**
     * 檢查附近的任務
     */
    checkNearbyQuests(location) {
        const quests = storage.getQuests();
        const triggerRadius = storage.getTriggerRadius();
        const questList = document.getElementById('questList');
        questList.innerHTML = '';

        let availableQuests = 0;

        quests.forEach(quest => {
            // 已完成的任務不顯示
            if (storage.isQuestCompleted(quest.id)) {
                return;
            }

            const isNearby = locationTracker.isNearby(quest.latitude, quest.longitude, triggerRadius);
            const isAccepted = storage.isQuestAccepted(quest.id);

            if (isNearby && !isAccepted) {
                availableQuests++;
                const card = this.createQuestCard(quest, true);
                card.addEventListener('click', () => {
                    this.showQuestDetails(quest, 'available');
                });
                questList.appendChild(card);
            }
        });

        if (availableQuests === 0) {
            questList.innerHTML = '<p class="empty-message">沒有附近的任務</p>';
        }
    }

    /**
     * 建立任務卡片
     */
    createQuestCard(quest, isNearby = false) {
        const card = document.createElement('div');
        card.className = 'quest-card';
        card.style.borderLeftColor = isNearby ? '#00b894' : '#b2bec3';

        const distance = locationTracker.getDistanceText(quest.latitude, quest.longitude);
        const statusText = isNearby ? '🎯 可接受' : `📍 ${distance}`;

        card.innerHTML = `
            <h3>${quest.name}</h3>
            <p>${quest.description || '沒有描述'}</p>
            <div class="quest-status ${isNearby ? 'status-available' : 'status-active'}">${statusText}</div>
        `;

        return card;
    }

    /**
     * 顯示任務詳情
     */
    showQuestDetails(quest, type = 'available') {
        this.currentQuest = quest;
        const modal = document.getElementById('questModal');
        const details = document.getElementById('questDetails');
        const acceptBtn = document.getElementById('acceptBtn');
        const completeBtn = document.getElementById('completeBtn');
        const abandonBtn = document.getElementById('abandonBtn');

        document.getElementById('questTitle').textContent = quest.name;

        let detailsHTML = `
            <div class="quest-detail-section">
                <h4>📖 描述</h4>
                <p>${quest.description || '沒有描述'}</p>
            </div>
            <div class="quest-detail-section">
                <h4>🎯 目標</h4>
                <p>${quest.objective || '完成任務'}</p>
            </div>
        `;

        if (quest.hint) {
            detailsHTML += `
                <div class="quest-detail-section">
                    <h4>💡 提示</h4>
                    <p>${quest.hint}</p>
                </div>
            `;
        }

        if (quest.reward) {
            detailsHTML += `
                <div class="quest-detail-section">
                    <h4>🏆 獎勵</h4>
                    <p>${quest.reward}</p>
                </div>
            `;
        }

        const distance = locationTracker.getDistanceText(quest.latitude, quest.longitude);
        detailsHTML += `
            <div class="quest-detail-section">
                <h4>📍 位置</h4>
                <p>距離: ${distance}</p>
                <p>坐標: ${locationTracker.formatLocation(quest.latitude, quest.longitude)}</p>
            </div>
        `;

        details.innerHTML = detailsHTML;

        // 根據任務狀態調整按鈕
        const isAccepted = storage.isQuestAccepted(quest.id);
        const isCompleted = storage.isQuestCompleted(quest.id);

        acceptBtn.style.display = !isAccepted && !isCompleted ? 'block' : 'none';
        completeBtn.style.display = isAccepted ? 'block' : 'none';
        abandonBtn.style.display = isAccepted ? 'block' : 'none';

        modal.style.display = 'block';
    }

    /**
     * 接受任務
     */
    acceptQuest(questId) {
        storage.acceptQuest(questId);
        this.refreshQuestLists();
        document.getElementById('questModal').style.display = 'none';
    }

    /**
     * 完成任務
     */
    completeQuest(questId) {
        const quest = storage.getQuest(questId);
        if (quest && confirm(`確定完成任務「${quest.name}」嗎？`)) {
            storage.completeQuest(questId);
            this.refreshQuestLists();
            document.getElementById('questModal').style.display = 'none';
        }
    }

    /**
     * 放棄任務
     */
    abandonQuest(questId) {
        const quest = storage.getQuest(questId);
        if (quest && confirm(`確定放棄任務「${quest.name}」嗎？`)) {
            storage.abandonQuest(questId);
            this.refreshQuestLists();
            document.getElementById('questModal').style.display = 'none';
        }
    }

    /**
     * 刷新任務列表
     */
    refreshQuestLists() {
        const player = storage.getPlayer();
        const quests = storage.getQuests();

        // 進行中的任務
        const inProgressList = document.getElementById('inProgressList');
        inProgressList.innerHTML = '';
        let inProgressCount = 0;

        player.activeQuests.forEach(questId => {
            const quest = storage.getQuest(questId);
            if (quest) {
                inProgressCount++;
                const card = document.createElement('div');
                card.className = 'quest-card';
                card.style.borderLeftColor = '#fdcb6e';
                card.innerHTML = `
                    <h3>${quest.name}</h3>
                    <p>${quest.description || '沒有描述'}</p>
                    <div class="quest-status status-active">⚔️ 進行中</div>
                `;
                card.addEventListener('click', () => {
                    this.showQuestDetails(quest, 'active');
                });
                inProgressList.appendChild(card);
            }
        });

        if (inProgressCount === 0) {
            inProgressList.innerHTML = '<p class="empty-message">沒有進行中的任務</p>';
        }

        // 已完成的任務
        const completedList = document.getElementById('completedList');
        completedList.innerHTML = '';
        let completedCount = 0;

        player.completedQuests.forEach(questId => {
            const quest = storage.getQuest(questId);
            if (quest) {
                completedCount++;
                const card = document.createElement('div');
                card.className = 'quest-card';
                card.style.borderLeftColor = '#00b894';
                card.innerHTML = `
                    <h3>${quest.name}</h3>
                    <p>${quest.description || '沒有描述'}</p>
                    <div class="quest-status status-completed">✅ 已完成</div>
                `;
                card.addEventListener('click', () => {
                    this.showQuestDetails(quest, 'completed');
                });
                completedList.appendChild(card);
            }
        });

        if (completedCount === 0) {
            completedList.innerHTML = '<p class="empty-message">還沒有完成任務</p>';
        }
    }

    /**
     * 打開編輯器
     */
    openEditor() {
        window.location.href = 'editor.html';
    }

    /**
     * 打開設定
     */
    openSettings() {
        const modal = document.getElementById('settingsModal');
        const settings = storage.getSettings();
        
        document.getElementById('triggerRadius').value = settings.triggerRadius;
        document.getElementById('updateInterval').value = settings.updateInterval;
        this.updateRadiusDisplay(settings.triggerRadius);
        this.updateIntervalDisplay(settings.updateInterval);
        
        modal.style.display = 'block';
    }

    /**
     * 更新半徑顯示
     */
    updateRadiusDisplay(value) {
        document.getElementById('radiusValue').textContent = value;
    }

    /**
     * 更新間隔顯示
     */
    updateIntervalDisplay(value) {
        document.getElementById('intervalValue').textContent = value;
    }

    /**
     * 重新啟動位置追蹤
     */
    restartLocationTracking() {
        locationTracker.stopTracking();
        setTimeout(() => {
            locationTracker.startTracking();
        }, 500);
    }
}

// 在 DOM 載入完成後初始化遊戲
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const game = new Game();
    });
} else {
    const game = new Game();
}
