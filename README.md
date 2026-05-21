# 🗺️ 實境RPG - 位置冒險遊戲

一個創新的實境角色扮演遊戲網站，結合位置服務和任務系統。玩家可以在接近特定位置時接受並完成任務。

## ✨ 功能特性

### 🎮 遊戲功能
- **位置基礎任務觸發**: 當玩家靠近任務位置時，任務會自動出現
- **實時位置追蹤**: 使用 Geolocation API 追蹤玩家位置
- **距離計算**: 自動計算到最近任務的距離
- **任務管理**: 接受、進行中、已完成任務的追蹤
- **本地儲存**: 所有數據保存在瀏覽器本地儲存中

### 🛠️ 編輯器功能
- **可視化任務編輯器**: 創建、編輯、刪除任務
- **位置設置**: 使用當前位置或手動輸入經緯度
- **密碼保護**: 只有擁有者能使用編輯器
- **任務預覽**: 實時預覽任務位置和觸發範圍

### ⚙️ 設定選項
- **觸發半徑調整**: 自定義任務觸發距離（50-500 米）
- **位置更新間隔**: 調整位置更新頻率（5-60 秒）
- **數據管理**: 清除所有本地存儲的數據

## 📋 系統需求

- 現代瀏覽器（支持 Geolocation API）
- 啟用 JavaScript
- 啟用本地儲存 (LocalStorage)
- 位置權限授予

## 🚀 快速開始

### 1. 克隆或下載項目
```bash
git clone <repository-url>
cd graduation-game
```

### 2. 啟動本地伺服器
由於使用了 Geolocation API，需要在 HTTPS 或 localhost 環境下運行。

**使用 Python 3:**
```bash
python3 -m http.server 8000
```

**使用 Node.js (http-server):**
```bash
npm install -g http-server
http-server
```

**使用 Live Server (VS Code):**
- 安裝 Live Server 擴展
- 右鍵點擊 index.html 選擇 "Open with Live Server"

### 3. 訪問應用
打開瀏覽器訪問 `http://localhost:8000`

## 📖 使用指南

### 遊戲模式

#### 首次使用
1. 打開 index.html
2. 允許位置訪問權限（瀏覽器會提示）
3. 等待位置獲取完成

#### 接受任務
1. 走到任務位置附近（觸發半徑內）
2. 任務會在"附近任務"區域顯示
3. 點擊任務卡片查看詳情
4. 點擊"接受任務"按鈕

#### 完成任務
1. 在"進行中的任務"區域點擊要完成的任務
2. 點擊"完成任務"按鈕
3. 任務會移至"已完成任務"區域

### 編輯器模式

#### 打開編輯器
1. 點擊遊戲界面上的"編輯任務"按鈕
2. 輸入編輯器密碼（默認: `123456`）

#### 創建新任務
1. 點擊"新增任務"按鈕
2. 填寫任務信息：
   - **任務名稱** (必填)
   - **描述** (可選)
   - **獎勵** (可選)
   - **目標** (必填)
   - **提示** (可選)

3. 設置任務位置：
   - 點擊"使用當前位置"獲取當前坐標
   - 或手動輸入經緯度
   - 設置觸發半徑

4. 點擊"保存任務"

#### 編輯任務
1. 從左邊列表中選擇任務
2. 在表單中修改信息
3. 點擊"保存任務"

#### 刪除任務
1. 從列表中選擇要刪除的任務
2. 點擊"刪除任務"
3. 確認刪除

## 🔒 安全性

### 編輯器密碼

編輯器使用密碼保護，防止未授權的修改。

**更改密碼方法：**
1. 打開瀏覽器開發者工具（F12）
2. 在控制台中執行：
```javascript
storage.setEditorPassword('新密碼');
```

**重置為默認密碼：**
```javascript
storage.setEditorPassword('123456');
```

## 💾 數據儲存

所有數據都保存在瀏覽器的 LocalStorage 中：
- 任務信息
- 玩家進度
- 設定選項

**LocalStorage 數據結構：**
```javascript
// 任務列表
graduation_game_quests = [
    {
        id: '時間戳',
        name: '任務名稱',
        description: '描述',
        objective: '目標',
        hint: '提示',
        reward: '獎勵',
        latitude: 25.033,
        longitude: 121.565,
        radius: 200,
        createdAt: '時間',
        updatedAt: '時間'
    }
]

// 玩家數據
graduation_game_player = {
    activeQuests: ['任務ID'],
    completedQuests: ['任務ID'],
    totalXP: 0
}

// 設定
graduation_game_settings = {
    triggerRadius: 200,
    updateInterval: 10,
    editorPassword: '123456'
}
```

## 📍 坐標示例

### 台灣常見位置
- **台北 101**: 25.0330, 121.5654
- **台大校園**: 25.0175, 121.5420
- **中正紀念堂**: 25.0330, 121.5194

您可以使用 [Google Maps](https://maps.google.com) 找到任何位置的坐標。

## 🐛 故障排除

### 問題: 無法獲取位置
- 確保允許了瀏覽器位置訪問
- 確保在 HTTPS 或 localhost 下運行
- 檢查設備的 GPS/位置服務是否啟用

### 問題: 任務不觸發
- 確認您已進入任務的觸發半徑
- 檢查任務坐標是否正確
- 嘗試調大觸發半徑設定

### 問題: 編輯器密碼遺忘
- 打開瀏覽器開發者工具
- 在控制台中運行：
```javascript
storage.getEditorPassword()
```
- 或重置為默認密碼

### 問題: 數據消失
- 確認是否不小心清除了瀏覽器數據
- 使用開發者工具檢查 LocalStorage
- 如無法恢復，使用編輯器重新創建任務

## 📱 響應式設計

應用支持多種設備：
- 🖥️ 桌面電腦
- 💻 平板電腦
- 📱 手機

## 🔧 技術棧

- **HTML5**: 頁面結構
- **CSS3**: 樣式和響應式設計
- **Vanilla JavaScript**: 核心邏輯
- **Geolocation API**: 位置服務
- **LocalStorage API**: 數據儲存

## 📚 文件結構

```
graduation-game/
├── index.html              # 主遊戲頁面
├── editor.html             # 任務編輯器頁面
├── css/
│   ├── style.css          # 遊戲樣式
│   └── editor.css         # 編輯器樣式
├── js/
│   ├── storage.js         # 本地儲存管理
│   ├── location.js        # 位置追蹤模塊
│   ├── game.js            # 主遊戲邏輯
│   └── editor.js          # 編輯器邏輯
└── README.md              # 本文件
```

## 🎨 自定義

### 更改編輯器密碼
```javascript
// 在瀏覽器控制台中執行
storage.setEditorPassword('您的新密碼');
```

### 更改默認觸發半徑
編輯 `js/storage.js` 中的 `initDefaults()` 方法：
```javascript
triggerRadius: 300 // 改為 300 米
```

### 更改界面顏色
編輯 CSS 文件中的 CSS 變量：
```css
:root {
    --primary-color: #6c5ce7; /* 修改主色 */
    --secondary-color: #0984e3;
    /* ... */
}
```

## 🌐 部署

### 部署到 GitHub Pages
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

然後在 GitHub 倉庫設定中啟用 GitHub Pages。

### 部署到其他託管服務
- Netlify
- Vercel
- Firebase Hosting
- Heroku

## 📝 許可證

本項目開源，可自由使用和修改。

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📧 聯絡方式

如有問題或建議，請聯絡開發者。

---

**祝您使用愉快！** 🎮✨