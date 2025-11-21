// Utility fonksiyonları

class Utils {
    // Tarih formatı dönüştürme
    static formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('tr-TR');
    }

    // Saat formatı dönüştürme
    static formatTime(time) {
        if (!time) return '';
        // Excel'den gelen saat formatını standart hale getir
        if (typeof time === 'number') {
            // Excel serial number to time
            const hours = Math.floor(time * 24);
            const minutes = Math.floor((time * 24 * 60) % 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        return time.toString();
    }

    // Çalışma saati hesaplama
    static calculateWorkHours(startTime, endTime) {
        if (!startTime || !endTime) return 0;
        
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);
        
        if (end < start) {
            // Gece vardiyası durumu
            return (24 - start) + end;
        }
        
        return end - start;
    }

    // Saat string'ini decimal'e çevirme
    static parseTime(timeStr) {
        if (typeof timeStr === 'number') return timeStr * 24;
        
        const parts = timeStr.toString().split(':');
        if (parts.length !== 2) return 0;
        
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        
        return hours + (minutes / 60);
    }

    // Sayı formatı
    static formatNumber(num, decimals = 0) {
        if (isNaN(num)) return '0';
        return Number(num).toLocaleString('tr-TR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    // Performans skoru hesaplama
    static calculatePerformanceScore(workHours, transactions, avgWorkHours, avgTransactions) {
        if (!avgWorkHours || !avgTransactions) return 0;
        
        const workScore = (workHours / avgWorkHours) * 50;
        const transactionScore = (transactions / avgTransactions) * 50;
        
        return Math.min(100, Math.max(0, workScore + transactionScore));
    }

    // Renk kodlama (performans bazlı)
    static getPerformanceColor(score) {
        if (score >= 80) return '#10b981'; // Yeşil
        if (score >= 60) return '#f59e0b'; // Sarı
        return '#ef4444'; // Kırmızı
    }

    // Debounce fonksiyonu
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Local Storage yardımcıları
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    }

    static loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage load error:', error);
            return null;
        }
    }

    // Notification gösterme
    static showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
            </div>
        `;

        container.appendChild(notification);

        // Otomatik kaldırma
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
    }

    // Loading gösterme/gizleme
    static showLoading(message = 'Yükleniyor...') {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.querySelector('p').textContent = message;
            overlay.classList.add('show');
            
            // Progress bar varsa güncelle
            const progressBar = overlay.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }
    }

    // Progress bar güncelleme
    static updateProgress(percentage, message) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            const progressBar = overlay.querySelector('.progress-bar');
            const progressText = overlay.querySelector('p');
            
            if (progressBar) {
                progressBar.style.width = percentage + '%';
            }
            
            if (progressText && message) {
                progressText.textContent = message;
            }
        }
    }

    static hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    // Excel kolon adı temizleme
    static cleanColumnName(name) {
        if (!name) return '';
        return name.toString().trim().toLowerCase()
            .replace(/[^\wçğıöşüÇĞIİÖŞÜ\s]/g, '') // Özel karakterleri kaldır ama Türkçe karakterleri koru
            .replace(/\s+/g, '') // Tüm boşlukları kaldır (daha sıkı eşleştirme için)
            .replace(/[ıi]/g, 'i') // ı ve i'yi normalize et
            .replace(/[şs]/g, 's') // ş ve s'yi normalize et
            .replace(/[ğg]/g, 'g') // ğ ve g'yi normalize et
            .replace(/[üu]/g, 'u') // ü ve u'yu normalize et
            .replace(/[öo]/g, 'o') // ö ve o'yu normalize et
            .replace(/[çc]/g, 'c'); // ç ve c'yi normalize et
    }

    // Hareket tipi kategorilendirme
    static categorizeMovementType(movementType) {
        if (!movementType) return 'Diğer';
        
        const type = movementType.toString().toLowerCase();
        
        if (type.includes('giriş') || type.includes('giris')) return 'Giriş';
        if (type.includes('çıkış') || type.includes('cikis')) return 'Çıkış';
        if (type.includes('transfer')) return 'Transfer';
        if (type.includes('toplama')) return 'Toplama';
        if (type.includes('dağıtım') || type.includes('dagitim')) return 'Dağıtım';
        
        return 'Diğer';
    }
}

// Global olarak erişilebilir yap
window.Utils = Utils;