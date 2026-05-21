/**
 * 本地儲存管理模塊
 * 管理所有數據的持久化存儲
 */

class StorageManager {
    constructor() {
        this.prefix = 'graduation_game_';
        this.questsKey = this.prefix + 'quests';
        this.playerKey = this.prefix + 'player';
        this.settingsKey = this.prefix + 'settings';
        this.authKey = this.prefix + 'auth';
        this.initDefaults();
    }

    /**
     * 初始化默認值
     */
    initDefaults() {
        if (!this.get(this.settingsKey)) {
            this.set(this.settingsKey, {
                triggerRadius: 200, // 米
                updateInterval: 10, // 秒
                editorPassword: '123456' // 默認編輯器密碼
            });
        }

        if (!this.get(this.playerKey)) {
            this.set(this.playerKey, {
                activeQuests: [],
                completedQuests: [],
                totalXP: 0
            });
        }

        if (!this.get(this.questsKey)) {
            this.set(this.questsKey, []);
        }
    }

    /**
     * 從 localStorage 取得數據
     */
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('讀取本地儲存出錯:', error);
            return null;
        }
    }

    /**
     * 保存數據到 localStorage
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('保存本地儲存出錯:', error);
            return false;
        }
    }

    /**
     * 從 localStorage 刪除數據
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('刪除本地儲存出錯:', error);
            return false;
        }
    }

    /**
     * 清除所有遊戲數據
     */
    clearAll() {
        try {
            for (let key in localStorage) {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            }
            this.initDefaults();
            return true;
        } catch (error) {
            console.error('清除數據出錯:', error);
            return false;
        }
    }

    // ==================== 任務管理 ====================

    /**
     * 取得所有任務
     */
    getQuests() {
        return this.get(this.questsKey) || [];
    }

    /**
     * 新增任務
     */
    addQuest(quest) {
        quest.id = Date.now().toString();
        quest.createdAt = new Date().toISOString();
        const quests = this.getQuests();
        quests.push(quest);
        this.set(this.questsKey, quests);
        return quest;
    }

    /**
     * 更新任務
     */
    updateQuest(id, updatedQuest) {
        const quests = this.getQuests();
        const index = quests.findIndex(q => q.id === id);
        if (index !== -1) {
            quests[index] = { ...quests[index], ...updatedQuest, updatedAt: new Date().toISOString() };
            this.set(this.questsKey, quests);
            return quests[index];
        }
        return null;
    }

    /**
     * 刪除任務
     */
    deleteQuest(id) {
        const quests = this.getQuests();
        const filtered = quests.filter(q => q.id !== id);
        this.set(this.questsKey, filtered);
        return true;
    }

    /**
     * 取得單個任務
     */
    getQuest(id) {
        const quests = this.getQuests();
        return quests.find(q => q.id === id);
    }

    // ==================== 玩家管理 ====================

    /**
     * 取得玩家數據
     */
    getPlayer() {
        return this.get(this.playerKey);
    }

    /**
     * 更新玩家數據
     */
    updatePlayer(updates) {
        const player = this.getPlayer();
        const updated = { ...player, ...updates };
        this.set(this.playerKey, updated);
        return updated;
    }

    /**
     * 接受任務
     */
    acceptQuest(questId) {
        const player = this.getPlayer();
        if (!player.activeQuests.includes(questId)) {
            player.activeQuests.push(questId);
            this.set(this.playerKey, player);
        }
        return player;
    }

    /**
     * 完成任務
     */
    completeQuest(questId) {
        const player = this.getPlayer();
        player.activeQuests = player.activeQuests.filter(id => id !== questId);
        if (!player.completedQuests.includes(questId)) {
            player.completedQuests.push(questId);
        }
        this.set(this.playerKey, player);
        return player;
    }

    /**
     * 放棄任務
     */
    abandonQuest(questId) {
        const player = this.getPlayer();
        player.activeQuests = player.activeQuests.filter(id => id !== questId);
        this.set(this.playerKey, player);
        return player;
    }

    /**
     * 檢查任務是否已接受
     */
    isQuestAccepted(questId) {
        const player = this.getPlayer();
        return player.activeQuests.includes(questId);
    }

    /**
     * 檢查任務是否已完成
     */
    isQuestCompleted(questId) {
        const player = this.getPlayer();
        return player.completedQuests.includes(questId);
    }

    // ==================== 設定管理 ====================

    /**
     * 取得設定
     */
    getSettings() {
        return this.get(this.settingsKey);
    }

    /**
     * 更新設定
     */
    updateSettings(updates) {
        const settings = this.getSettings();
        const updated = { ...settings, ...updates };
        this.set(this.settingsKey, updated);
        return updated;
    }

    /**
     * 取得任務觸發半徑
     */
    getTriggerRadius() {
        return this.getSettings().triggerRadius;
    }

    /**
     * 設定任務觸發半徑
     */
    setTriggerRadius(radius) {
        this.updateSettings({ triggerRadius: radius });
    }

    /**
     * 取得位置更新間隔
     */
    getUpdateInterval() {
        return this.getSettings().updateInterval;
    }

    /**
     * 設定位置更新間隔
     */
    setUpdateInterval(interval) {
        this.updateSettings({ updateInterval: interval });
    }

    /**
     * 取得編輯器密碼
     */
    getEditorPassword() {
        return this.getSettings().editorPassword;
    }

    /**
     * 設定編輯器密碼
     */
    setEditorPassword(password) {
        this.updateSettings({ editorPassword: password });
    }

    // ==================== 認證管理 ====================

    /**
     * 檢查編輯器認證
     */
    isEditorAuthenticated() {
        return sessionStorage.getItem('editor_authenticated') === 'true';
    }

    /**
     * 設定編輯器認證
     */
    setEditorAuthenticated(value) {
        if (value) {
            sessionStorage.setItem('editor_authenticated', 'true');
        } else {
            sessionStorage.removeItem('editor_authenticated');
        }
    }

    /**
     * 驗證編輯器密碼
     */
    verifyEditorPassword(password) {
        const correctPassword = this.getEditorPassword();
        return password === correctPassword;
    }
}

// 建立全局儲存管理實例
const storage = new StorageManager();
