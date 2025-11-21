// Debug bilgilerini ekranda gösterme yardımcısı

class DebugHelper {
    constructor() {
        this.debugPanel = null;
        this.isVisible = false;
    }

    // Debug panelini oluştur
    createDebugPanel() {
        if (this.debugPanel) return;

        this.debugPanel = document.createElement('div');
        this.debugPanel.id = 'debug-panel';
        this.debugPanel.innerHTML = `
            <div class="debug-header">
                <h4>🔍 Debug Bilgileri</h4>
                <button class="debug-close" onclick="window.DebugHelper.hide()">×</button>
            </div>
            <div class="debug-content" id="debug-content">
                <p>Debug bilgileri burada görünecek...</p>
            </div>
        `;

        document.body.appendChild(this.debugPanel);
    }

    // Debug panelini göster
    show() {
        this.createDebugPanel();
        this.debugPanel.style.display = 'block';
        this.isVisible = true;
    }

    // Debug panelini gizle
    hide() {
        if (this.debugPanel) {
            this.debugPanel.style.display = 'none';
        }
        this.isVisible = false;
    }

    // Debug mesajı ekle
    log(message, type = 'info') {
        this.createDebugPanel();
        
        const content = document.getElementById('debug-content');
        if (!content) return;

        const timestamp = new Date().toLocaleTimeString('tr-TR');
        const messageDiv = document.createElement('div');
        messageDiv.className = `debug-message debug-${type}`;
        messageDiv.innerHTML = `
            <span class="debug-time">[${timestamp}]</span>
            <span class="debug-text">${message}</span>
        `;

        content.appendChild(messageDiv);
        content.scrollTop = content.scrollHeight;

        // Otomatik göster
        if (!this.isVisible) {
            this.show();
        }
    }

    // Debug panelini temizle
    clear() {
        const content = document.getElementById('debug-content');
        if (content) {
            content.innerHTML = '<p>Debug bilgileri temizlendi...</p>';
        }
    }
}

// Global olarak erişilebilir yap
window.DebugHelper = new DebugHelper();