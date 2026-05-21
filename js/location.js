/**
 * 位置追蹤模塊
 * 使用 Geolocation API 追蹤用戶位置
 */

class LocationTracker {
    constructor() {
        this.currentLocation = null;
        this.watchId = null;
        this.isTracking = false;
        this.updateCallbacks = [];
        this.errorCallbacks = [];
    }

    /**
     * 開始追蹤位置
     */
    startTracking(options = {}) {
        if (this.isTracking) {
            console.warn('已在追蹤位置');
            return;
        }

        if (!navigator.geolocation) {
            this.handleError('您的瀏覽器不支持位置追蹤');
            return;
        }

        this.isTracking = true;
        const updateInterval = storage.getUpdateInterval() * 1000; // 轉換為毫秒

        // 首先取得一次位置
        this.getPosition();

        // 定期更新位置
        this.watchId = setInterval(() => {
            this.getPosition();
        }, updateInterval);
    }

    /**
     * 停止追蹤位置
     */
    stopTracking() {
        if (this.watchId) {
            clearInterval(this.watchId);
            this.watchId = null;
        }
        this.isTracking = false;
    }

    /**
     * 取得當前位置
     */
    getPosition() {
        if (!navigator.geolocation) {
            this.handleError('您的瀏覽器不支持位置追蹤');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => this.handlePosition(position),
            (error) => this.handleLocationError(error),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    /**
     * 處理位置信息
     */
    handlePosition(position) {
        const { latitude, longitude, accuracy } = position.coords;
        this.currentLocation = {
            latitude,
            longitude,
            accuracy,
            timestamp: new Date()
        };

        // 通知所有監聽者
        this.updateCallbacks.forEach(callback => {
            callback(this.currentLocation);
        });
    }

    /**
     * 處理位置錯誤
     */
    handleLocationError(error) {
        let message = '取得位置失敗: ';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message += '您拒絕了位置訪問權限。請在設定中允許位置訪問。';
                break;
            case error.POSITION_UNAVAILABLE:
                message += '位置信息暫時無法取得。';
                break;
            case error.TIMEOUT:
                message += '取得位置超時。';
                break;
            default:
                message += '未知錯誤。';
        }
        this.handleError(message);
    }

    /**
     * 處理錯誤
     */
    handleError(message) {
        console.error(message);
        this.errorCallbacks.forEach(callback => {
            callback(message);
        });
    }

    /**
     * 添加位置更新回調
     */
    onLocationUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    /**
     * 移除位置更新回調
     */
    offLocationUpdate(callback) {
        this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
    }

    /**
     * 添加錯誤回調
     */
    onError(callback) {
        this.errorCallbacks.push(callback);
    }

    /**
     * 移除錯誤回調
     */
    offError(callback) {
        this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    }

    /**
     * 取得當前位置
     */
    getCurrentLocation() {
        return this.currentLocation;
    }

    /**
     * 計算兩個坐標之間的距離 (公里)
     * 使用 Haversine 公式
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // 地球半徑 (公里)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * 檢查用戶是否在特定位置內
     */
    isNearby(questLat, questLon, radiusMeters = 200) {
        if (!this.currentLocation) {
            return false;
        }

        const distanceKm = LocationTracker.calculateDistance(
            this.currentLocation.latitude,
            this.currentLocation.longitude,
            questLat,
            questLon
        );

        const distanceMeters = distanceKm * 1000;
        return distanceMeters <= radiusMeters;
    }

    /**
     * 取得到最近任務的距離
     */
    getDistanceToQuest(questLat, questLon) {
        if (!this.currentLocation) {
            return null;
        }

        const distanceKm = LocationTracker.calculateDistance(
            this.currentLocation.latitude,
            this.currentLocation.longitude,
            questLat,
            questLon
        );

        return distanceKm;
    }

    /**
     * 取得到最近任務的距離（公里文本）
     */
    getDistanceText(questLat, questLon) {
        const distance = this.getDistanceToQuest(questLat, questLon);
        if (distance === null) return '--';

        if (distance < 0.001) {
            return '0 公里';
        } else if (distance < 1) {
            return Math.round(distance * 1000) + ' 米';
        } else {
            return distance.toFixed(2) + ' 公里';
        }
    }

    /**
     * 格式化位置信息
     */
    formatLocation(lat, lon) {
        return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
}

// 建立全局位置追蹤實例
const locationTracker = new LocationTracker();
