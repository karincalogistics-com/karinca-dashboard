// Grafik yönetim modülü - Chart.js ile görselleştirme

class ChartManager {
    constructor() {
        this.charts = {};
        this.chartConfigs = {};
        this.colors = {
            primary: '#2563eb',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#06b6d4',
            purple: '#8b5cf6',
            pink: '#ec4899',
            orange: '#f97316'
        };
        
        this.gradients = {};
        this.isInitialized = false;
    }

    // Chart Manager'ı başlat
    initialize() {
        if (this.isInitialized) return;
        
        try {
            // Chart.js yüklü mü kontrol et
            if (typeof Chart === 'undefined') {
                throw new Error('Chart.js kütüphanesi yüklenmedi');
            }
            
            // Chart.js global ayarları
            Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
            Chart.defaults.font.size = 12;
            Chart.defaults.color = '#64748b';
            Chart.defaults.borderColor = '#e2e8f0';
            Chart.defaults.backgroundColor = 'rgba(37, 99, 235, 0.1)';
            
            // Responsive ayarları
            Chart.defaults.responsive = true;
            Chart.defaults.maintainAspectRatio = false;
            
            // Layout ayarları
            Chart.defaults.layout = {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            };
            
            // Animation ayarları
            Chart.defaults.animation.duration = 1000;
            Chart.defaults.animation.easing = 'easeOutQuart';
            
            this.isInitialized = true;
            console.log('Chart Manager başarıyla başlatıldı');
            
        } catch (error) {
            console.error('Chart Manager başlatma hatası:', error);
            
            // Kullanıcıya bilgi ver
            Utils.showNotification('Grafik kütüphanesi yüklenemedi. Sayfayı yenileyin.', 'error');
            
            // Tüm grafik alanlarında hata göster
            this.showGlobalChartError('Chart.js kütüphanesi yüklenemedi');
            
            throw error;
        }
    }

    // Global grafik hatası gösterme
    showGlobalChartError(message) {
        const chartCanvases = document.querySelectorAll('[id$="-chart"]');
        chartCanvases.forEach(canvas => {
            const container = canvas.parentElement;
            if (container) {
                container.innerHTML = `
                    <div class="chart-error global-error">
                        <div class="error-content">
                            <div class="error-icon">📊❌</div>
                            <div class="error-message">
                                <h4>Grafik Sistemi Hatası</h4>
                                <p>${message}</p>
                                <p><small>Sayfayı yenileyerek tekrar deneyin.</small></p>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    }

    // Tüm grafikleri güncelle
    updateAllCharts(processedData) {
        if (!processedData) {
            console.warn('Processed data bulunamadı');
            return;
        }
        
        try {
            this.initialize();
            
            // Veri kontrolü
            if (!this.validateData(processedData)) {
                console.warn('Grafik verisi geçersiz');
                return;
            }
            
            // Çalışma saatleri grafiği
            this.safeUpdateChart('workHours', () => this.updateWorkHoursChart(processedData));
            
            // Hareket tipi dağılımı
            this.safeUpdateChart('movementType', () => this.updateMovementTypeChart(processedData));
            
            // Personel performans karşılaştırması
            this.safeUpdateChart('performance', () => this.updatePerformanceChart(processedData));
            
            // Depo aktivite yoğunluğu
            this.safeUpdateChart('warehouseActivity', () => this.updateWarehouseActivityChart(processedData));
            
            console.log('Tüm grafikler güncellendi');
            
        } catch (error) {
            console.error('Grafik güncelleme hatası:', error);
            Utils.showNotification('Grafikler güncellenirken hata oluştu: ' + error.message, 'error');
        }
    }

    // Güvenli grafik güncelleme
    safeUpdateChart(chartName, updateFunction) {
        try {
            updateFunction();
        } catch (error) {
            console.error(`${chartName} grafiği güncellenirken hata:`, error);
            this.showChartError(chartName, error.message);
        }
    }

    // Veri doğrulama
    validateData(data) {
        console.log('📊 ChartManager validateData çağrıldı:', data);
        
        if (!data || typeof data !== 'object') {
            console.error('Geçersiz veri formatı');
            if (window.DebugHelper) {
                window.DebugHelper.log('❌ Geçersiz veri formatı', 'error');
            }
            return false;
        }
        
        if (!Array.isArray(data.personnel) || data.personnel.length === 0) {
            console.error('Personel verisi bulunamadı');
            if (window.DebugHelper) {
                window.DebugHelper.log(`❌ Personel verisi bulunamadı: ${data.personnel ? data.personnel.length : 'undefined'}`, 'error');
            }
            return false;
        }
        
        if (!Array.isArray(data.warehouses)) {
            console.error('Depo verisi bulunamadı');
            if (window.DebugHelper) {
                window.DebugHelper.log(`❌ Depo verisi bulunamadı: ${data.warehouses ? 'var ama array değil' : 'yok'}`, 'error');
            }
            return false;
        }
        
        if (!Array.isArray(data.movementTypes) || data.movementTypes.length === 0) {
            console.error('Hareket tipi verisi bulunamadı');
            if (window.DebugHelper) {
                window.DebugHelper.log(`❌ Hareket tipi verisi bulunamadı: ${data.movementTypes ? data.movementTypes.length : 'undefined'}`, 'error');
            }
            return false;
        }
        
        console.log('✅ ChartManager veri doğrulaması başarılı');
        if (window.DebugHelper) {
            window.DebugHelper.log('✅ ChartManager veri doğrulaması başarılı', 'success');
        }
        
        return true;
    }

    // Grafik hatası gösterme
    showChartError(chartName, errorMessage) {
        const canvas = document.getElementById(`${chartName.replace(/([A-Z])/g, '-$1').toLowerCase()}-chart`);
        if (!canvas) return;
        
        const container = canvas.parentElement;
        if (!container) return;
        
        // Hata mesajı div'i oluştur
        let errorDiv = container.querySelector('.chart-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'chart-error';
            container.appendChild(errorDiv);
        }
        
        errorDiv.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <div class="error-message">
                    <h4>Grafik Yüklenemedi</h4>
                    <p>${errorMessage}</p>
                </div>
                <button class="retry-btn" onclick="window.ChartManager.retryChart('${chartName}')">
                    Tekrar Dene
                </button>
            </div>
        `;
        
        // Canvas'ı gizle
        canvas.style.display = 'none';
    }

    // Grafik yeniden deneme
    retryChart(chartName) {
        const canvas = document.getElementById(`${chartName.replace(/([A-Z])/g, '-$1').toLowerCase()}-chart`);
        const container = canvas?.parentElement;
        const errorDiv = container?.querySelector('.chart-error');
        
        if (errorDiv) {
            errorDiv.remove();
        }
        
        if (canvas) {
            canvas.style.display = 'block';
        }
        
        // Grafiği yeniden güncelle
        if (window.AppState.processedData) {
            this.updateAllCharts(window.AppState.processedData);
        }
    }

    // Çalışma saatleri çizgi grafiği
    updateWorkHoursChart(data) {
        const canvas = document.getElementById('work-hours-chart');
        if (!canvas) return;
        
        // Mevcut grafiği yok et
        if (this.charts.workHours) {
            this.charts.workHours.destroy();
        }
        
        // Canvas context'i al
        const ctx = canvas.getContext('2d');
        
        // Veri hazırlama - Son 7 gün
        const chartData = this.prepareWorkHoursData(data);
        
        const config = {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Günlük Ortalama Çalışma Saati',
                    data: chartData.values,
                    borderColor: this.colors.primary,
                    backgroundColor: this.createGradient(ctx, this.colors.primary),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: this.colors.primary,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: (context) => {
                                return `Çalışma Saati: ${context.parsed.y.toFixed(1)} saat`;
                            }
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 12,
                        grid: {
                            color: 'rgba(226, 232, 240, 0.5)'
                        },
                        ticks: {
                            color: '#64748b',
                            callback: (value) => value + 'h'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        };
        
        this.charts.workHours = new Chart(canvas, config);
        this.chartConfigs.workHours = config;
    }

    // Hareket tipi dağılım pasta grafiği
    updateMovementTypeChart(data) {
        const canvas = document.getElementById('movement-type-chart');
        if (!canvas) return;
        
        if (this.charts.movementType) {
            this.charts.movementType.destroy();
        }
        
        const chartData = this.prepareMovementTypeData(data);
        
        const config = {
            type: 'doughnut',
            data: {
                labels: chartData.labels,
                datasets: [{
                    data: chartData.values,
                    backgroundColor: [
                        this.colors.primary,
                        this.colors.success,
                        this.colors.warning,
                        this.colors.danger,
                        this.colors.info,
                        this.colors.purple
                    ],
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                layout: {
                    padding: {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                const percentage = ((context.parsed / chartData.total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };
        
        this.charts.movementType = new Chart(canvas, config);
        this.chartConfigs.movementType = config;
    }

    // Personel performans bar grafiği
    updatePerformanceChart(data) {
        const canvas = document.getElementById('performance-chart');
        if (!canvas) return;
        
        if (this.charts.performance) {
            this.charts.performance.destroy();
        }
        
        const chartData = this.preparePerformanceData(data);
        
        const config = {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Performans Skoru',
                    data: chartData.values,
                    backgroundColor: chartData.colors,
                    borderColor: chartData.colors.map(color => color.replace('0.8', '1')),
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                return `Performans: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b',
                            maxRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(226, 232, 240, 0.5)'
                        },
                        ticks: {
                            color: '#64748b',
                            callback: (value) => value + '%'
                        }
                    }
                }
            }
        };
        
        this.charts.performance = new Chart(canvas, config);
        this.chartConfigs.performance = config;
    }

    // Depo aktivite yoğunluğu grafiği
    updateWarehouseActivityChart(data) {
        const canvas = document.getElementById('warehouse-activity-chart');
        if (!canvas) return;
        
        if (this.charts.warehouseActivity) {
            this.charts.warehouseActivity.destroy();
        }
        
        const chartData = this.prepareWarehouseActivityData(data);
        
        const config = {
            type: 'radar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'İşlem Sayısı',
                    data: chartData.values,
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary.replace('1)', '0.2)'),
                    borderWidth: 2,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        cornerRadius: 8
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(226, 232, 240, 0.5)'
                        },
                        angleLines: {
                            color: 'rgba(226, 232, 240, 0.5)'
                        },
                        ticks: {
                            color: '#64748b',
                            backdropColor: 'transparent'
                        }
                    }
                }
            }
        };
        
        this.charts.warehouseActivity = new Chart(canvas, config);
        this.chartConfigs.warehouseActivity = config;
    }

    // Veri hazırlama fonksiyonları
    prepareWorkHoursData(data) {
        // Son 7 günün verilerini hazırla
        const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
        const values = [];
        
        // Basit simülasyon - gerçek uygulamada tarih bazlı analiz yapılır
        for (let i = 0; i < 7; i++) {
            const avgHours = data.averageWorkHours + (Math.random() - 0.5) * 2;
            values.push(Math.max(0, Math.min(12, avgHours)));
        }
        
        return {
            labels: days,
            values: values
        };
    }

    prepareMovementTypeData(data) {
        const movementTypes = data.movementTypes || [];
        const labels = movementTypes.map(mt => mt.type);
        const values = movementTypes.map(mt => mt.count);
        const total = values.reduce((sum, val) => sum + val, 0);
        
        return {
            labels: labels,
            values: values,
            total: total
        };
    }

    preparePerformanceData(data) {
        // En iyi 10 personeli al
        const topPersonnel = data.personnel.slice(0, 10);
        const labels = topPersonnel.map(p => p.name.split(' ')[0]); // Sadece isim
        const values = topPersonnel.map(p => p.performanceScore || 0);
        
        // Performansa göre renk ver
        const colors = values.map(score => {
            if (score >= 80) return this.colors.success + '80';
            if (score >= 60) return this.colors.warning + '80';
            return this.colors.danger + '80';
        });
        
        return {
            labels: labels,
            values: values,
            colors: colors
        };
    }

    prepareWarehouseActivityData(data) {
        const warehouses = data.warehouses || [];
        const labels = warehouses.map(w => w.name);
        const values = warehouses.map(w => w.totalTransactions);
        
        return {
            labels: labels,
            values: values
        };
    }

    // Gradient oluşturma
    createGradient(ctx, color) {
        try {
            // Canvas context kontrolü
            if (!ctx || typeof ctx.createLinearGradient !== 'function') {
                console.warn('Geçersiz canvas context, solid color kullanılıyor');
                return color + '40'; // Fallback olarak solid color döndür
            }
            
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, color + '40');
            gradient.addColorStop(1, color + '00');
            return gradient;
        } catch (error) {
            console.warn('Gradient oluşturma hatası:', error);
            return color + '40'; // Fallback olarak solid color döndür
        }
    }

    // Belirli personel için grafikleri güncelle
    updateChartsForPersonnel(personnelName) {
        if (!window.AppState.processedData) return;
        
        const personnel = window.AppState.processedData.personnel.find(p => p.name === personnelName);
        if (!personnel) return;
        
        console.log('📊 Grafikler personel için güncelleniyor:', personnelName);
        
        // Personel odaklı veri hazırlama ve grafik güncelleme
        this.highlightPersonnelInCharts(personnel);
        
        // Personel bazlı hareket tipi grafiği güncelle
        this.updatePersonnelMovementChart(personnel);
        
        // Personel bazlı çalışma saati grafiği güncelle
        this.updatePersonnelWorkHoursChart(personnel);
    }

    // Personel bazlı hareket tipi grafiği
    updatePersonnelMovementChart(personnel) {
        const canvas = document.getElementById('movement-type-chart');
        if (!canvas || !this.charts.movementType) return;
        
        const chart = this.charts.movementType;
        
        // Personelin hareket tipi verilerini al
        const movementData = personnel.movementTypesArray || [];
        
        if (movementData.length > 0) {
            chart.data.labels = movementData.map(m => m.type);
            chart.data.datasets[0].data = movementData.map(m => m.count);
            chart.update('none');
        }
    }

    // Personel bazlı çalışma saati grafiği
    updatePersonnelWorkHoursChart(personnel) {
        const canvas = document.getElementById('work-hours-chart');
        if (!canvas || !this.charts.workHours) return;
        
        const chart = this.charts.workHours;
        
        // Personelin günlük çalışma verilerini hazırla
        const workData = this.preparePersonnelWorkData(personnel);
        
        if (workData.labels.length > 0) {
            chart.data.labels = workData.labels;
            chart.data.datasets[0].data = workData.values;
            chart.data.datasets[0].label = `${personnel.name} - Günlük Çalışma`;
            chart.update('none');
        }
    }

    // Personel çalışma verisi hazırlama
    preparePersonnelWorkData(personnel) {
        const workDays = new Map();
        
        // Personelin işlemlerini günlere göre grupla
        if (personnel.transactions) {
            personnel.transactions.forEach(transaction => {
                if (!transaction.islemTarihi) return;
                
                const dateKey = transaction.islemTarihi.toDateString();
                const date = new Date(transaction.islemTarihi);
                const dayLabel = date.toLocaleDateString('tr-TR', { 
                    month: 'short', 
                    day: 'numeric' 
                });
                
                if (!workDays.has(dateKey)) {
                    workDays.set(dateKey, {
                        label: dayLabel,
                        hours: 0,
                        transactions: 0
                    });
                }
                
                workDays.get(dateKey).transactions++;
            });
        }
        
        // Her gün için çalışma saati tahmin et (işlem sayısına göre)
        workDays.forEach(day => {
            day.hours = Math.min(12, Math.max(1, day.transactions * 0.1)); // Her 10 işlem ≈ 1 saat
        });
        
        const sortedDays = Array.from(workDays.values())
            .sort((a, b) => a.label.localeCompare(b.label))
            .slice(-7); // Son 7 gün
        
        return {
            labels: sortedDays.map(d => d.label),
            values: sortedDays.map(d => d.hours)
        };
    }

    // Personeli grafiklerde vurgula
    highlightPersonnelInCharts(personnel) {
        // Performans grafiğinde personeli vurgula
        if (this.charts.performance) {
            const chart = this.charts.performance;
            const personnelIndex = chart.data.labels.findIndex(label => 
                personnel.name.includes(label)
            );
            
            if (personnelIndex !== -1) {
                // Tüm barları soluk yap
                chart.data.datasets[0].backgroundColor = chart.data.datasets[0].backgroundColor.map(
                    color => color.replace('80', '40')
                );
                
                // Seçili personeli vurgula
                chart.data.datasets[0].backgroundColor[personnelIndex] = this.colors.primary + 'FF';
                chart.update('none');
            }
        }
    }

    // Grafikleri yeniden boyutlandır
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    // Grafikleri temizle
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
        this.chartConfigs = {};
    }

    // Export için grafik görüntüsü al
    getChartImage(chartName) {
        const chart = this.charts[chartName];
        if (!chart) return null;
        
        return chart.toBase64Image('image/png', 1);
    }
}

// Global olarak erişilebilir yap
window.ChartManager = new ChartManager();

// Window resize olayını dinle
window.addEventListener('resize', Utils.debounce(() => {
    if (window.ChartManager) {
        window.ChartManager.resizeCharts();
    }
}, 250));