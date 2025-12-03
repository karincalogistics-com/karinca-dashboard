// GitHub'dan otomatik veri çekme modülü

const DataFetcher = {
    // Ayarlar
    settings: {
        githubUrl: localStorage.getItem('github_data_url') || '',
        autoRefresh: localStorage.getItem('auto_refresh') === 'true',
        refreshInterval: parseInt(localStorage.getItem('refresh_interval')) || 3600000, // 1 saat
        lastFetch: null,
        timer: null
    },

    // GitHub'dan veri çek
    async fetchFromGitHub(url) {
        try {
            console.log('📥 GitHub\'dan veri çekiliyor:', url);
            
            if (!url || url.trim() === '') {
                throw new Error('GitHub URL boş olamaz');
            }

            // Raw URL'e çevir (eğer normal GitHub linki ise)
            const rawUrl = this.convertToRawUrl(url);
            
            const response = await fetch(rawUrl, {
                cache: 'no-cache',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Dosya tipini kontrol et
            const contentType = response.headers.get('content-type');
            console.log('📄 Content-Type:', contentType);

            // Blob olarak al
            const blob = await response.blob();
            
            if (blob.size === 0) {
                throw new Error('Dosya boş');
            }

            console.log('✅ Dosya indirildi:', (blob.size / 1024).toFixed(2), 'KB');

            // Dosya adını URL'den çıkar
            const fileName = this.getFileNameFromUrl(rawUrl);
            
            // Blob'u File objesine çevir
            const file = new File([blob], fileName, { 
                type: blob.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });

            // Son çekme zamanını kaydet
            this.settings.lastFetch = new Date();
            localStorage.setItem('last_fetch_time', this.settings.lastFetch.toISOString());

            return file;

        } catch (error) {
            console.error('❌ GitHub veri çekme hatası:', error);
            throw new Error(`GitHub'dan veri çekilemedi: ${error.message}`);
        }
    },

    // Normal GitHub URL'i raw URL'e çevir
    convertToRawUrl(url) {
        if (url.includes('raw.githubusercontent.com')) {
            return url;
        }
        
        if (url.includes('github.com')) {
            // https://github.com/user/repo/blob/main/file.xlsx
            // -> https://raw.githubusercontent.com/user/repo/main/file.xlsx
            return url
                .replace('github.com', 'raw.githubusercontent.com')
                .replace('/blob/', '/');
        }
        
        return url;
    },

    // URL'den dosya adını çıkar
    getFileNameFromUrl(url) {
        const parts = url.split('/');
        return parts[parts.length - 1] || 'data.xlsx';
    },

    // Otomatik yenilemeyi başlat
    startAutoRefresh() {
        if (!this.settings.githubUrl) {
            console.warn('⚠️ GitHub URL ayarlanmamış');
            return;
        }

        this.stopAutoRefresh();

        console.log(`🔄 Otomatik yenileme başlatıldı (${this.settings.refreshInterval / 60000} dakika)`);

        this.settings.timer = setInterval(async () => {
            try {
                console.log('🔄 Otomatik veri yenileme...');
                await this.loadFromGitHub();
            } catch (error) {
                console.error('❌ Otomatik yenileme hatası:', error);
            }
        }, this.settings.refreshInterval);

        this.settings.autoRefresh = true;
        localStorage.setItem('auto_refresh', 'true');
    },

    // Otomatik yenilemeyi durdur
    stopAutoRefresh() {
        if (this.settings.timer) {
            clearInterval(this.settings.timer);
            this.settings.timer = null;
        }
        this.settings.autoRefresh = false;
        localStorage.setItem('auto_refresh', 'false');
        console.log('⏸️ Otomatik yenileme durduruldu');
    },

    // GitHub'dan yükle ve işle
    async loadFromGitHub() {
        try {
            if (!this.settings.githubUrl) {
                throw new Error('GitHub URL ayarlanmamış');
            }

            Utils.showLoading('GitHub\'dan veri çekiliyor...');

            const file = await this.fetchFromGitHub(this.settings.githubUrl);
            
            // Dosyayı işle (mevcut processFile fonksiyonunu kullan)
            if (window.processFile) {
                await window.processFile(file);
                Utils.showNotification('✅ Veriler GitHub\'dan başarıyla yüklendi', 'success');
            } else {
                throw new Error('processFile fonksiyonu bulunamadı');
            }

            Utils.hideLoading();

        } catch (error) {
            Utils.hideLoading();
            console.error('❌ GitHub yükleme hatası:', error);
            Utils.showNotification(error.message, 'error');
            throw error;
        }
    },

    // Ayarları kaydet
    saveSettings(url, autoRefresh, interval) {
        this.settings.githubUrl = url;
        this.settings.autoRefresh = autoRefresh;
        this.settings.refreshInterval = interval;

        localStorage.setItem('github_data_url', url);
        localStorage.setItem('auto_refresh', autoRefresh.toString());
        localStorage.setItem('refresh_interval', interval.toString());

        console.log('💾 Ayarlar kaydedildi:', this.settings);
    },

    // Ayarları yükle
    loadSettings() {
        this.settings.githubUrl = localStorage.getItem('github_data_url') || '';
        this.settings.autoRefresh = localStorage.getItem('auto_refresh') === 'true';
        this.settings.refreshInterval = parseInt(localStorage.getItem('refresh_interval')) || 3600000;
        
        const lastFetchStr = localStorage.getItem('last_fetch_time');
        if (lastFetchStr) {
            this.settings.lastFetch = new Date(lastFetchStr);
        }

        return this.settings;
    },

    // Son çekme zamanını göster
    getLastFetchTime() {
        if (!this.settings.lastFetch) {
            return 'Henüz çekilmedi';
        }

        const now = new Date();
        const diff = now - this.settings.lastFetch;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} gün önce`;
        if (hours > 0) return `${hours} saat önce`;
        if (minutes > 0) return `${minutes} dakika önce`;
        return 'Az önce';
    }
};

// Global erişim
window.DataFetcher = DataFetcher;
