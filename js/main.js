// Ana başlatma dosyası

// Test fonksiyonları HTML'de tanımlandı

document.addEventListener('DOMContentLoaded', function() {
    console.log('Personel Performans Dashboard yükleniyor...');
    
    // Global uygulama durumu
    window.AppState = {
        data: null,
        processedData: null,
        selectedPersonnel: null,
        filters: {
            warehouse: '',
            dateRange: 'daily'
        },
        autoRefresh: {
            enabled: true,
            interval: 30000, // 30 saniye
            timer: null,
            lastUpdate: null
        },
        performance: {
            thresholds: {
                excellent: 90,
                good: 70,
                warning: 50
            },
            alerts: []
        }
    };
    
    // Ana bileşenleri başlat
    initializeApp();
});

function initializeApp() {
    try {
        console.log('🚀 Dashboard başlatılıyor...');
        
        // Debug helper'ı test et
        if (window.DebugHelper) {
            window.DebugHelper.log('Dashboard başlatılıyor...', 'info');
        }
        
        // Modül kontrolü
        console.log('📊 Modül kontrolleri:');
        console.log('  - Utils:', typeof Utils !== 'undefined' ? '✅' : '❌');
        console.log('  - ExcelParser:', typeof window.ExcelParser !== 'undefined' ? '✅' : '❌');
        console.log('  - DataProcessor:', typeof window.DataProcessor !== 'undefined' ? '✅' : '❌');
        console.log('  - ChartManager:', typeof window.ChartManager !== 'undefined' ? '✅' : '❌');
        console.log('  - Chart.js:', typeof Chart !== 'undefined' ? '✅' : '❌');
        console.log('  - XLSX:', typeof XLSX !== 'undefined' ? '✅' : '❌');
        
        // Debug helper'a modül durumlarını logla
        if (window.DebugHelper) {
            window.DebugHelper.log(`Modül kontrolleri tamamlandı`, 'success');
            window.DebugHelper.log(`Utils: ${typeof Utils !== 'undefined' ? 'OK' : 'HATA'}`, typeof Utils !== 'undefined' ? 'success' : 'error');
            window.DebugHelper.log(`ExcelParser: ${typeof window.ExcelParser !== 'undefined' ? 'OK' : 'HATA'}`, typeof window.ExcelParser !== 'undefined' ? 'success' : 'error');
            window.DebugHelper.log(`DataProcessor: ${typeof window.DataProcessor !== 'undefined' ? 'OK' : 'HATA'}`, typeof window.DataProcessor !== 'undefined' ? 'success' : 'error');
        }
        
        // ChartManager'ı başlat
        if (window.ChartManager) {
            window.ChartManager.initialize();
            console.log('✅ ChartManager başlatıldı');
            if (window.DebugHelper) {
                window.DebugHelper.log('ChartManager başlatıldı', 'success');
            }
        } else {
            console.error('❌ ChartManager yüklenmedi');
            if (window.DebugHelper) {
                window.DebugHelper.log('❌ ChartManager yüklenmedi', 'error');
            }
        }
        
        // Excel upload işlevselliği index.html'de tanımlı
        
        // Event listener'ları kur
        setupEventListeners();
        
        // Ayarları geri yükle
        loadRefreshSettings();
        
        // Önceki veriyi kontrol et
        checkPreviousData();
        
        console.log('✅ Dashboard başarıyla başlatıldı!');
        
    } catch (error) {
        console.error('❌ Dashboard başlatma hatası:', error);
        Utils.showNotification('Dashboard başlatılırken hata oluştu: ' + error.message, 'error');
    }
}





function processFile(file) {
    console.log('📊 processFile çağrıldı:', file.name, file.type, file.size);
    
    // Debug helper'a da logla
    if (window.DebugHelper) {
        window.DebugHelper.log(`Dosya işleme başlatılıyor: ${file.name}`, 'info');
        window.DebugHelper.log(`Dosya tipi: ${file.type}, Boyut: ${(file.size / 1024 / 1024).toFixed(2)} MB`, 'info');
    }
    
    // Dosya tipini kontrol et
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        if (window.DebugHelper) {
            window.DebugHelper.log(`❌ Geçersiz dosya formatı: ${file.type}`, 'error');
        }
        Utils.showNotification('Geçersiz dosya formatı. Lütfen Excel (.xlsx, .xls) veya CSV dosyası seçin.', 'error');
        return;
    }
    
    // Dosya boyutunu kontrol et (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
        if (window.DebugHelper) {
            window.DebugHelper.log(`❌ Dosya çok büyük: ${(file.size / 1024 / 1024).toFixed(2)} MB`, 'error');
        }
        Utils.showNotification('Dosya boyutu çok büyük. Maksimum 100MB dosya yükleyebilirsiniz.', 'error');
        return;
    }
    
    // Büyük dosyalar için uyarı (50MB+)
    if (file.size > 50 * 1024 * 1024) {
        if (window.DebugHelper) {
            window.DebugHelper.log(`⚠️ Büyük dosya tespit edildi: ${(file.size / 1024 / 1024).toFixed(2)} MB`, 'warning');
        }
        Utils.showNotification(`Büyük dosya (${(file.size / 1024 / 1024).toFixed(1)}MB) yükleniyor. Bu biraz zaman alabilir...`, 'warning');
    }
    
    Utils.showLoading('Excel dosyası okunuyor...');
    
    if (window.DebugHelper) {
        window.DebugHelper.log('Loading gösterildi, Excel parser çağrılıyor...', 'info');
    }
    
    // ExcelParser ile dosyayı işle
    if (window.ExcelParser) {
        window.ExcelParser.parseFile(file)
            .then(data => {
                Utils.hideLoading();
                handleDataLoaded(data);
            })
            .catch(error => {
                Utils.hideLoading();
                console.error('Excel okuma hatası:', error);
                
                // Debug helper'a da logla
                if (window.DebugHelper) {
                    window.DebugHelper.log(`❌ Excel okuma hatası: ${error.message}`, 'error');
                }
                
                Utils.showNotification('Excel dosyası okunurken hata oluştu: ' + error.message, 'error');
            });
    } else {
        Utils.hideLoading();
        Utils.showNotification('Excel parser yüklenmedi. Sayfayı yenileyin.', 'error');
    }
}

async function handleDataLoaded(data) {
    try {
        console.log('📊 handleDataLoaded çağrıldı, veri:', data);
        console.log('📊 Veri uzunluğu:', data ? data.length : 'undefined');
        
        // Debug helper'a veri yükleme bilgisini logla
        if (window.DebugHelper) {
            window.DebugHelper.log(`Veri yüklendi: ${data ? data.length : 0} kayıt`, 'info');
            if (data && data.length > 0) {
                window.DebugHelper.log(`İlk kayıt örneği: ${JSON.stringify(data[0])}`, 'info');
            }
        }
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            if (window.DebugHelper) {
                window.DebugHelper.log('Veri boş veya geçersiz!', 'error');
            }
            Utils.showNotification('Excel dosyasında geçerli veri bulunamadı', 'warning');
            return;
        }
        
        // Veriyi global state'e kaydet
        window.AppState.data = data;
        
        // Veriyi işle
        if (window.DataProcessor) {
            Utils.showLoading('Veriler işleniyor...');
            
            console.log('📊 DataProcessor ile veri işleniyor...');
            const processedData = await window.DataProcessor.processData(data);
            console.log('📊 İşlenmiş veri:', processedData);
            
            if (!processedData || !processedData.personnel || processedData.personnel.length === 0) {
                Utils.hideLoading();
                
                // Debug helper'a detaylı hata bilgisi logla
                if (window.DebugHelper) {
                    window.DebugHelper.log('Veri işleme sonrası personel bulunamadı!', 'error');
                    window.DebugHelper.log(`processedData: ${processedData ? 'var' : 'yok'}`, 'error');
                    if (processedData) {
                        window.DebugHelper.log(`processedData.personnel: ${processedData.personnel ? processedData.personnel.length : 'yok'}`, 'error');
                        window.DebugHelper.log(`processedData keys: ${Object.keys(processedData).join(', ')}`, 'info');
                    }
                }
                
                Utils.showNotification('Veri işlendikten sonra personel bilgisi bulunamadı. Excel kolonlarını kontrol edin.', 'error');
                return;
            }
            
            window.AppState.processedData = processedData;
            
            // Büyük dosyalar için local storage'a kaydetme (memory tasarrufu)
            if (data.length < 10000) {
                Utils.saveToStorage('dashboard_data', data);
                Utils.saveToStorage('dashboard_processed', processedData);
            } else {
                console.log('📊 Büyük dosya tespit edildi, local storage atlandı');
                if (window.DebugHelper) {
                    window.DebugHelper.log('Büyük dosya - local storage atlandı', 'warning');
                }
            }
            
            console.log('📊 Dashboard gösteriliyor...');
            // Dashboard'u göster
            showDashboard();
            
            console.log('📊 Dashboard güncelleniyor...');
            // Dashboard'u güncelle
            updateDashboard();
            
            Utils.hideLoading();
            Utils.showNotification(`${data.length} kayıt başarıyla yüklendi, ${processedData.personnel.length} personel analiz edildi`, 'success');
            
        } else {
            Utils.showNotification('Veri işleyici yüklenmedi. Sayfayı yenileyin.', 'error');
        }
        
    } catch (error) {
        Utils.hideLoading();
        console.error('Veri işleme hatası:', error);
        Utils.showNotification('Veriler işlenirken hata oluştu: ' + error.message, 'error');
    }
}

function showDashboard() {
    console.log('📊 showDashboard çağrıldı');
    
    const uploadSection = document.getElementById('upload-section');
    const dashboardContent = document.getElementById('dashboard-content');
    const uploadNewBtn = document.getElementById('upload-new-btn');
    
    console.log('📊 DOM elementleri:', {
        uploadSection: uploadSection ? 'bulundu' : 'bulunamadı',
        dashboardContent: dashboardContent ? 'bulundu' : 'bulunamadı',
        uploadNewBtn: uploadNewBtn ? 'bulundu' : 'bulunamadı'
    });
    
    // Debug helper'a da logla
    if (window.DebugHelper) {
        window.DebugHelper.log('Dashboard gösteriliyor...', 'info');
        window.DebugHelper.log(`Upload section: ${uploadSection ? 'OK' : 'HATA'}`, uploadSection ? 'success' : 'error');
        window.DebugHelper.log(`Dashboard content: ${dashboardContent ? 'OK' : 'HATA'}`, dashboardContent ? 'success' : 'error');
    }
    
    if (uploadSection && dashboardContent) {
        uploadSection.style.display = 'none';
        dashboardContent.style.display = 'block';
        
        console.log('📊 Dashboard content gösterildi');
        
        // Yeni dosya yükleme butonunu göster
        if (uploadNewBtn) {
            uploadNewBtn.style.display = 'inline-flex';
            console.log('📊 Upload new button gösterildi');
        }
        
        if (window.DebugHelper) {
            window.DebugHelper.log('✅ Dashboard başarıyla gösterildi', 'success');
        }
    } else {
        console.error('❌ Dashboard elementleri bulunamadı!');
        if (window.DebugHelper) {
            window.DebugHelper.log('❌ Dashboard elementleri bulunamadı!', 'error');
        }
    }
}

function showUploadSection() {
    const uploadSection = document.getElementById('upload-section');
    const dashboardContent = document.getElementById('dashboard-content');
    const uploadNewBtn = document.getElementById('upload-new-btn');
    
    if (uploadSection && dashboardContent) {
        uploadSection.style.display = 'flex';
        dashboardContent.style.display = 'none';
        
        // Yeni dosya yükleme butonunu gizle
        if (uploadNewBtn) {
            uploadNewBtn.style.display = 'none';
        }
    }
    
    // Mevcut veriyi temizle
    clearCurrentData();
}

function clearCurrentData() {
    // Global state'i temizle
    window.AppState.data = null;
    window.AppState.processedData = null;
    window.AppState.selectedPersonnel = null;
    
    // Grafikleri temizle
    if (window.ChartManager) {
        window.ChartManager.destroyAllCharts();
    }
    
    // Local storage'ı temizle
    localStorage.removeItem('dashboard_data');
    localStorage.removeItem('dashboard_processed');
    
    // Otomatik yenilemeyi durdur
    stopAutoRefresh();
    
    console.log('Mevcut veriler temizlendi');
}

function updateDashboard() {
    console.log('📊 updateDashboard çağrıldı');
    const processedData = window.AppState.processedData;
    
    if (!processedData) {
        console.error('❌ processedData bulunamadı');
        if (window.DebugHelper) {
            window.DebugHelper.log('❌ processedData bulunamadı', 'error');
        }
        return;
    }
    
    console.log('📊 ProcessedData:', processedData);
    console.log('📊 Personnel sayısı:', processedData.personnel ? processedData.personnel.length : 'undefined');
    
    // Debug helper'a da logla
    if (window.DebugHelper) {
        window.DebugHelper.log('Dashboard güncelleniyor...', 'info');
        window.DebugHelper.log(`Personnel sayısı: ${processedData.personnel ? processedData.personnel.length : 0}`, 'info');
        window.DebugHelper.log(`Toplam işlem: ${processedData.totalTransactions || 0}`, 'info');
    }
    
    try {
        // KPI'ları güncelle
        console.log('📊 KPI\'lar güncelleniyor...');
        updateKPIs(processedData);
        
        // Personel grid'ini güncelle
        console.log('📊 Personel gridi güncelleniyor...');
        updatePersonnelGrid(processedData.personnel);
        
        // Sidebar'ı güncelle
        updateSidebar(processedData);
        
        // Grafikleri güncelle
        console.log('📊 Grafikler güncelleniyor...');
        if (window.ChartManager) {
            window.ChartManager.updateAllCharts(processedData);
        } else {
            console.error('❌ ChartManager bulunamadı');
        }
        
        // Summary listelerini güncelle
        console.log('📊 Summary listeleri güncelleniyor...');
        updateSummaryLists(processedData);
        
        console.log('✅ Dashboard güncelleme tamamlandı');
        
    } catch (error) {
        console.error('❌ Dashboard güncelleme hatası:', error);
        Utils.showNotification('Dashboard güncellenirken hata oluştu: ' + error.message, 'error');
    }
}

function updateKPIs(data) {
    console.log('📊 updateKPIs çağrıldı, data:', data);
    
    // Debug helper'a da logla
    if (window.DebugHelper) {
        window.DebugHelper.log('KPI\'lar güncelleniyor...', 'info');
    }
    
    // Toplam personel
    const totalPersonnel = document.getElementById('total-personnel');
    console.log('📊 totalPersonnel element:', totalPersonnel);
    
    if (window.DebugHelper) {
        window.DebugHelper.log(`Total personnel element: ${totalPersonnel ? 'OK' : 'HATA'}`, totalPersonnel ? 'success' : 'error');
    }
    
    if (totalPersonnel) {
        const count = data.personnel ? data.personnel.length : 0;
        console.log('📊 Personel sayısı:', count);
        animateNumber(totalPersonnel, 0, count, 1000);
        
        // Personel kartına renk ver
        const personnelCard = totalPersonnel.closest('.kpi-card');
        if (personnelCard) {
            updateKPICardStatus(personnelCard, count, 20, 30); // 20+ iyi, 30+ mükemmel
        }
    }
    
    // Günlük işlem (miktar kolonundan)
    const dailyTransactions = document.getElementById('daily-transactions');
    if (dailyTransactions) {
        const count = data.totalQuantity || 0; // Toplam miktar
        animateNumber(dailyTransactions, 0, count, 1200);
        
        // İşlem kartına renk ver
        const transactionCard = dailyTransactions.closest('.kpi-card');
        if (transactionCard) {
            updateKPICardStatus(transactionCard, count, 500, 1000); // 500+ iyi, 1000+ mükemmel
        }
    }
    
    // Ortalama çalışma saati
    const avgWorkHours = document.getElementById('avg-work-hours');
    if (avgWorkHours) {
        const avg = data.averageWorkHours || 0;
        animateNumber(avgWorkHours, 0, avg, 1000, 1, 'h');
        
        // Çalışma saati kartına renk ver
        const workHoursCard = avgWorkHours.closest('.kpi-card');
        if (workHoursCard) {
            updateKPICardStatus(workHoursCard, avg, 7, 8); // 7+ iyi, 8+ mükemmel
        }
    }
    
    // Aktif proje sayısı
    const activeWarehouses = document.getElementById('active-warehouses');
    if (activeWarehouses) {
        const count = data.warehouses.length;
        animateNumber(activeWarehouses, 0, count, 800);
        
        // Proje kartına renk ver
        const warehouseCard = activeWarehouses.closest('.kpi-card');
        if (warehouseCard) {
            updateKPICardStatus(warehouseCard, count, 2, 4); // 2+ iyi, 4+ mükemmel
        }
    }
    
    // Ek KPI bilgileri göster
    updateAdditionalKPIs(data);
}

// Sayı animasyonu
function animateNumber(element, start, end, duration, decimals = 0, suffix = '') {
    const startTime = performance.now();
    const difference = end - start;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (difference * easeOut);
        
        element.textContent = current.toFixed(decimals) + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = end.toFixed(decimals) + suffix;
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// KPI kartı durum güncelleme
function updateKPICardStatus(card, value, goodThreshold, excellentThreshold) {
    // Önceki durumu temizle
    card.classList.remove('kpi-good', 'kpi-excellent', 'kpi-warning');
    
    if (value >= excellentThreshold) {
        card.classList.add('kpi-excellent');
    } else if (value >= goodThreshold) {
        card.classList.add('kpi-good');
    } else {
        card.classList.add('kpi-warning');
    }
}

// Ek KPI bilgileri
function updateAdditionalKPIs(data) {
    // Performans özeti tooltip'leri ekle
    addKPITooltips(data);
    
    // Trend göstergeleri ekle
    addTrendIndicators(data);
}

// KPI tooltip'leri
function addKPITooltips(data) {
    const kpiCards = document.querySelectorAll('.kpi-card');
    
    kpiCards.forEach((card, index) => {
        let tooltipText = '';
        
        switch (index) {
            case 0: // Personel
                const activePersonnel = data.personnel.filter(p => p.isActive).length;
                const inactivePersonnel = data.personnel.length - activePersonnel;
                tooltipText = `Aktif: ${activePersonnel} | Beklemede: ${inactivePersonnel}`;
                break;
                
            case 1: // İşlemler
                const avgPerPersonnel = Math.round(data.totalTransactions / data.personnel.length);
                tooltipText = `Personel başına ortalama: ${avgPerPersonnel} işlem`;
                break;
                
            case 2: // Çalışma saati
                const minHours = Math.min(...data.personnel.map(p => p.averageWorkHours || 0));
                const maxHours = Math.max(...data.personnel.map(p => p.averageWorkHours || 0));
                tooltipText = `Min: ${minHours.toFixed(1)}h | Max: ${maxHours.toFixed(1)}h`;
                break;
                
            case 3: // Depolar
                const mostActiveWarehouse = data.warehouses[0]?.name || 'N/A';
                tooltipText = `En aktif: ${mostActiveWarehouse}`;
                break;
        }
        
        if (tooltipText) {
            card.setAttribute('title', tooltipText);
            card.style.cursor = 'help';
        }
    });
}

// Trend göstergeleri
function addTrendIndicators(data) {
    // Bu fonksiyon gelecekte trend analizi için kullanılabilir
    // Şimdilik basit göstergeler ekleyelim
    
    const kpiCards = document.querySelectorAll('.kpi-card');
    
    kpiCards.forEach((card, index) => {
        const existingTrend = card.querySelector('.trend-indicator');
        if (existingTrend) {
            existingTrend.remove();
        }
        
        const trendIndicator = document.createElement('div');
        trendIndicator.className = 'trend-indicator';
        
        // Basit trend hesaplama (gerçek uygulamada geçmiş verilerle karşılaştırılır)
        let trendValue = 0;
        let trendIcon = '→';
        let trendClass = 'trend-neutral';
        
        switch (index) {
            case 0: // Personel - aktif personel oranı
                const activeRatio = data.personnel.filter(p => p.isActive).length / data.personnel.length;
                if (activeRatio > 0.8) {
                    trendIcon = '↗';
                    trendClass = 'trend-up';
                    trendValue = Math.round((activeRatio - 0.8) * 100);
                } else if (activeRatio < 0.6) {
                    trendIcon = '↘';
                    trendClass = 'trend-down';
                    trendValue = Math.round((0.6 - activeRatio) * 100);
                }
                break;
                
            case 1: // İşlemler - günlük ortalama
                const dailyAvg = data.statistics?.averageTransactionsPerDay || 0;
                if (dailyAvg > 100) {
                    trendIcon = '↗';
                    trendClass = 'trend-up';
                    trendValue = Math.round(dailyAvg - 100);
                }
                break;
                
            case 2: // Çalışma saati
                const avgHours = data.averageWorkHours;
                if (avgHours > 8) {
                    trendIcon = '↗';
                    trendClass = 'trend-up';
                    trendValue = Math.round((avgHours - 8) * 10);
                } else if (avgHours < 7) {
                    trendIcon = '↘';
                    trendClass = 'trend-down';
                    trendValue = Math.round((7 - avgHours) * 10);
                }
                break;
        }
        
        trendIndicator.innerHTML = `<span class="${trendClass}">${trendIcon}</span>`;
        if (trendValue > 0) {
            trendIndicator.innerHTML += ` <small>+${trendValue}%</small>`;
        }
        
        card.appendChild(trendIndicator);
    });
}

function updatePersonnelList(personnel) {
    console.log('📊 updatePersonnelList çağrıldı:', personnel ? personnel.length : 'undefined');
    
    const personnelList = document.getElementById('personnel-list');
    if (!personnelList) {
        console.error('❌ personnel-list elementi bulunamadı');
        if (window.DebugHelper) {
            window.DebugHelper.log('❌ personnel-list elementi bulunamadı', 'error');
        }
        return;
    }
    
    if (!personnel) {
        console.error('❌ personnel verisi bulunamadı');
        if (window.DebugHelper) {
            window.DebugHelper.log('❌ personnel verisi bulunamadı', 'error');
        }
        return;
    }
    
    console.log('📊 Personel listesi güncelleniyor:', personnel.length, 'personel');
    if (window.DebugHelper) {
        window.DebugHelper.log(`Personel listesi güncelleniyor: ${personnel.length} personel`, 'info');
    }
    
    // Loading state göster
    personnelList.innerHTML = '<div class="personnel-loading">Personel listesi yükleniyor...</div>';
    
    // Depo filtresi seçeneklerini güncelle
    updateWarehouseFilter(personnel);
    
    // Kısa gecikme ile liste oluştur (UX için)
    setTimeout(() => {
        personnelList.innerHTML = '';
        
        // Personeli performansa göre sırala
        const sortedPersonnel = [...personnel].sort((a, b) => {
            return (b.performanceScore || 0) - (a.performanceScore || 0);
        });
        
        sortedPersonnel.forEach((person, index) => {
            const item = createPersonnelItem(person, index);
            personnelList.appendChild(item);
        });
        
        // İlk personeli seç
        if (sortedPersonnel.length > 0) {
            selectPersonnel(sortedPersonnel[0].name);
        }
        
        // Personel sayısını göster
        updatePersonnelCount(personnel.length);
        
    }, 300);
}

function createPersonnelItem(person, index) {
    const item = document.createElement('div');
    item.className = 'personnel-item';
    item.dataset.personnel = person.name;
    item.dataset.warehouse = person.warehousesArray?.[0] || '';
    item.dataset.performance = person.performanceScore || 0;
    
    const performanceColor = Utils.getPerformanceColor(person.performanceScore || 0);
    const performanceLevel = getPerformanceLevel(person.performanceScore || 0);
    
    // Rank badge
    const rankBadge = index < 3 ? `<div class="rank-badge rank-${index + 1}">#${index + 1}</div>` : '';
    
    item.innerHTML = `
        ${rankBadge}
        <div class="personnel-avatar">
            <span class="avatar-text">${getInitials(person.name)}</span>
            <div class="performance-ring" style="--performance: ${person.performanceScore || 0}%">
                <div class="performance-fill"></div>
            </div>
        </div>
        <div class="personnel-info">
            <div class="personnel-name">${person.name}</div>
            <div class="personnel-stats">
                <div class="stat-item">
                    <span class="stat-icon">⏰</span>
                    <span class="stat-value">${(person.totalWorkHours || 0).toFixed(1)}h</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">📦</span>
                    <span class="stat-value">${person.totalTransactions || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">🏢</span>
                    <span class="stat-value">${person.warehousesArray?.length || 0}</span>
                </div>
            </div>
            <div class="personnel-performance">
                <div class="performance-bar">
                    <div class="performance-fill" style="width: ${person.performanceScore || 0}%; background: ${performanceColor}"></div>
                </div>
                <span class="performance-score" style="color: ${performanceColor}">
                    ${(person.performanceScore || 0).toFixed(0)}%
                </span>
            </div>
        </div>
        <div class="personnel-status">
            <div class="performance-level ${performanceLevel.class}">
                ${performanceLevel.text}
            </div>
        </div>
    `;
    
    // Hover efekti için performans rengi
    item.style.setProperty('--hover-color', performanceColor);
    
    // Tıklama olayı
    item.addEventListener('click', () => {
        selectPersonnel(person.name);
    });
    
    // Sağ tık menüsü (gelecekte detay için)
    item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showPersonnelContextMenu(e, person);
    });
    
    return item;
}

function getInitials(name) {
    return name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getPerformanceLevel(score) {
    if (score >= 85) return { text: 'Üstün', class: 'level-excellent' };
    if (score >= 75) return { text: 'Yüksek', class: 'level-very-good' };
    if (score >= 65) return { text: 'Orta+', class: 'level-good' };
    if (score >= 50) return { text: 'Orta', class: 'level-average' };
    if (score >= 35) return { text: 'Gelişim', class: 'level-poor' };
    return { text: 'Kritik', class: 'level-critical' };
}

function updateWarehouseFilter(personnel) {
    const warehouseFilter = document.getElementById('warehouse-filter');
    if (!warehouseFilter) return;
    
    // Unique depoları topla
    const warehouses = new Set();
    personnel.forEach(person => {
        if (person.warehousesArray) {
            person.warehousesArray.forEach(warehouse => warehouses.add(warehouse));
        }
    });
    
    // Mevcut seçimi koru
    const currentValue = warehouseFilter.value;
    
    // Seçenekleri güncelle
    warehouseFilter.innerHTML = '<option value="">Tüm Depolar</option>';
    
    Array.from(warehouses).sort().forEach(warehouse => {
        const option = document.createElement('option');
        option.value = warehouse;
        option.textContent = warehouse;
        if (warehouse === currentValue) {
            option.selected = true;
        }
        warehouseFilter.appendChild(option);
    });
}

function updatePersonnelCount(count) {
    const personnelList = document.getElementById('personnel-list');
    if (!personnelList) return;
    
    // Mevcut sayaç varsa kaldır
    const existingCounter = personnelList.parentNode.querySelector('.personnel-counter');
    if (existingCounter) {
        existingCounter.remove();
    }
    
    // Yeni sayaç ekle
    const counter = document.createElement('div');
    counter.className = 'personnel-counter';
    counter.innerHTML = `
        <span class="counter-text">Toplam: </span>
        <span class="counter-number">${count}</span>
        <span class="counter-label"> personel</span>
    `;
    
    personnelList.parentNode.insertBefore(counter, personnelList);
}

function showPersonnelContextMenu(event, person) {
    // Basit context menu (gelecekte genişletilebilir)
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    
    menu.innerHTML = `
        <div class="context-menu-item" onclick="showPersonnelDetails('${person.name}')">
            <span class="menu-icon">👤</span>
            Detayları Göster
        </div>
        <div class="context-menu-item" onclick="exportPersonnelData('${person.name}')">
            <span class="menu-icon">📊</span>
            Rapor Al
        </div>
    `;
    
    document.body.appendChild(menu);
    
    // Dışarı tıklandığında kapat
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
            document.removeEventListener('click', closeMenu);
        });
    }, 100);
}

function showPersonnelDetails(personnelName) {
    // Personel detay modal'ı (gelecekte implement edilecek)
    Utils.showNotification(`${personnelName} detayları gösteriliyor...`, 'info');
}

function exportPersonnelData(personnelName) {
    // Personel bazlı export (gelecekte implement edilecek)
    Utils.showNotification(`${personnelName} raporu hazırlanıyor...`, 'info');
}

function showRefreshSettings() {
    const modal = document.createElement('div');
    modal.className = 'refresh-settings-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Otomatik Yenileme Ayarları</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="auto-refresh-enabled" 
                               ${window.AppState.autoRefresh.enabled ? 'checked' : ''}>
                        Otomatik yenilemeyi etkinleştir
                    </label>
                </div>
                <div class="setting-group">
                    <label for="refresh-interval">Yenileme aralığı (saniye):</label>
                    <select id="refresh-interval">
                        <option value="10000" ${window.AppState.autoRefresh.interval === 10000 ? 'selected' : ''}>10 saniye</option>
                        <option value="30000" ${window.AppState.autoRefresh.interval === 30000 ? 'selected' : ''}>30 saniye</option>
                        <option value="60000" ${window.AppState.autoRefresh.interval === 60000 ? 'selected' : ''}>1 dakika</option>
                        <option value="300000" ${window.AppState.autoRefresh.interval === 300000 ? 'selected' : ''}>5 dakika</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label>Son güncelleme: ${window.AppState.autoRefresh.lastUpdate ? 
                        window.AppState.autoRefresh.lastUpdate.toLocaleString('tr-TR') : 'Henüz yok'}</label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeRefreshSettings()">İptal</button>
                <button class="btn btn-primary" onclick="saveRefreshSettings()">Kaydet</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Modal kapatma
    modal.querySelector('.modal-close').addEventListener('click', closeRefreshSettings);
    modal.querySelector('.modal-overlay').addEventListener('click', closeRefreshSettings);
}

function closeRefreshSettings() {
    const modal = document.querySelector('.refresh-settings-modal');
    if (modal) {
        modal.remove();
    }
}

function saveRefreshSettings() {
    const enabled = document.getElementById('auto-refresh-enabled').checked;
    const interval = parseInt(document.getElementById('refresh-interval').value);
    
    window.AppState.autoRefresh.enabled = enabled;
    window.AppState.autoRefresh.interval = interval;
    
    // Ayarları kaydet
    Utils.saveToStorage('refresh_settings', {
        enabled: enabled,
        interval: interval
    });
    
    // Yenilemeyi yeniden başlat
    if (enabled) {
        startAutoRefresh();
        Utils.showNotification('Otomatik yenileme ayarları kaydedildi', 'success');
    } else {
        stopAutoRefresh();
        Utils.showNotification('Otomatik yenileme kapatıldı', 'info');
    }
    
    closeRefreshSettings();
}

// Sayfa yüklendiğinde ayarları geri yükle
function loadRefreshSettings() {
    const settings = Utils.loadFromStorage('refresh_settings');
    if (settings) {
        window.AppState.autoRefresh.enabled = settings.enabled;
        window.AppState.autoRefresh.interval = settings.interval;
    }
}

function selectPersonnel(personnelName) {
    // Önceki seçimi kaldır
    document.querySelectorAll('.personnel-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Yeni seçimi işaretle
    const selectedCard = document.querySelector(`[data-personnel="${personnelName}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    }
    
    // Global state'i güncelle
    window.AppState.selectedPersonnel = personnelName;
    
    // Grafikleri güncelle
    if (window.ChartManager) {
        window.ChartManager.updateChartsForPersonnel(personnelName);
    }
    
    // Summary listelerinde seçili personeli vurgula
    highlightPersonnelInSummary(personnelName);
}

function setupEventListeners() {
    // Yeni dosya yükleme butonu
    const uploadNewBtn = document.getElementById('upload-new-btn');
    if (uploadNewBtn) {
        uploadNewBtn.addEventListener('click', () => {
            if (confirm('Mevcut veriler silinecek ve yeni dosya yükleme ekranına dönülecek. Devam etmek istiyor musunuz?')) {
                showUploadSection();
                Utils.showNotification('Yeni dosya yüklemek için dosyanızı seçin', 'info');
            }
        });
    }
    
    // Yenile butonu
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            if (e.ctrlKey || e.metaKey) {
                // Ctrl+Click ile otomatik yenileme toggle
                toggleAutoRefresh();
            } else {
                // Normal click ile manuel yenileme
                if (window.AppState.data) {
                    refreshDashboardData();
                }
            }
        });
        
        // Uzun basma ile otomatik yenileme ayarları
        let longPressTimer;
        refreshBtn.addEventListener('mousedown', () => {
            longPressTimer = setTimeout(() => {
                showRefreshSettings();
            }, 1000);
        });
        
        refreshBtn.addEventListener('mouseup', () => {
            clearTimeout(longPressTimer);
        });
        
        refreshBtn.addEventListener('mouseleave', () => {
            clearTimeout(longPressTimer);
        });
    }
    
    // Export butonu
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Arama
    const searchInput = document.getElementById('personnel-search');
    if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce(handleSearch, 150));
    }
    
    // Depo filtresi
    const warehouseFilter = document.getElementById('warehouse-filter');
    if (warehouseFilter) {
        warehouseFilter.addEventListener('change', handleWarehouseFilter);
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    const personnelItems = document.querySelectorAll('.personnel-card');
    
    // Boş arama - tümünü göster
    if (!searchTerm) {
        personnelItems.forEach(item => {
            item.style.display = 'block';
        });
        return;
    }
    
    // Hızlı arama - requestAnimationFrame ile
    requestAnimationFrame(() => {
        personnelItems.forEach(item => {
            const name = item.dataset.personnel.toLowerCase();
            const isVisible = name.includes(searchTerm);
            item.style.display = isVisible ? 'block' : 'none';
            
            // İlk eşleşeni otomatik seç
            if (isVisible && !document.querySelector('.personnel-card.active:not([style*="none"])')) {
                const personnelName = item.dataset.personnel;
                selectPersonnel(personnelName);
            }
        });
    });
}

function handleWarehouseFilter(e) {
    const selectedWarehouse = e.target.value;
    window.AppState.filters.warehouse = selectedWarehouse;
    
    // Filtrelenmiş veriyi yeniden işle
    if (window.AppState.data && window.DataProcessor) {
        const filteredData = window.DataProcessor.filterByWarehouse(
            window.AppState.data, 
            selectedWarehouse
        );
        const processedData = window.DataProcessor.processData(filteredData);
        window.AppState.processedData = processedData;
        updateDashboard();
    }
}

function exportData() {
    if (!window.AppState.processedData) {
        Utils.showNotification('Export edilecek veri bulunamadı', 'warning');
        return;
    }
    
    try {
        // Basit CSV export
        const data = window.AppState.processedData.personnel;
        const csvContent = generateCSV(data);
        downloadCSV(csvContent, 'personel_performans_raporu.csv');
        
        Utils.showNotification('Rapor başarıyla export edildi', 'success');
    } catch (error) {
        console.error('Export hatası:', error);
        Utils.showNotification('Export işlemi sırasında hata oluştu', 'error');
    }
}

function generateCSV(data) {
    const headers = ['Personel Adı', 'Toplam Çalışma Saati', 'İşlem Sayısı', 'Performans Skoru', 'Durum'];
    const rows = data.map(person => [
        person.name,
        (person.totalWorkHours || 0).toFixed(2),
        person.transactionCount || 0,
        (person.performanceScore || 0).toFixed(1),
        person.isActive ? 'Aktif' : 'Beklemede'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function checkPreviousData() {
    const savedData = Utils.loadFromStorage('dashboard_data');
    const savedProcessed = Utils.loadFromStorage('dashboard_processed');
    
    if (savedData && savedProcessed) {
        window.AppState.data = savedData;
        window.AppState.processedData = savedProcessed;
        
        showDashboard();
        updateDashboard();
        
        // Otomatik yenilemeyi başlat
        startAutoRefresh();
        
        Utils.showNotification('Önceki veriler yüklendi', 'info');
    }
}

// Otomatik yenileme sistemi
function startAutoRefresh() {
    if (!window.AppState.autoRefresh.enabled) return;
    
    // Mevcut timer'ı temizle
    if (window.AppState.autoRefresh.timer) {
        clearInterval(window.AppState.autoRefresh.timer);
    }
    
    // Yeni timer başlat
    window.AppState.autoRefresh.timer = setInterval(() => {
        refreshDashboardData();
    }, window.AppState.autoRefresh.interval);
    
    // Son güncelleme zamanını kaydet
    window.AppState.autoRefresh.lastUpdate = new Date();
    
    console.log('Otomatik yenileme başlatıldı:', window.AppState.autoRefresh.interval / 1000, 'saniye');
    
    // UI'de göster
    updateRefreshIndicator();
}

function stopAutoRefresh() {
    if (window.AppState.autoRefresh.timer) {
        clearInterval(window.AppState.autoRefresh.timer);
        window.AppState.autoRefresh.timer = null;
    }
    
    window.AppState.autoRefresh.enabled = false;
    updateRefreshIndicator();
    
    console.log('Otomatik yenileme durduruldu');
}

function refreshDashboardData() {
    if (!window.AppState.data) return;
    
    try {
        console.log('Dashboard verileri yenileniyor...');
        
        // Veriyi yeniden işle (simülasyon - gerçek uygulamada API'den çekilir)
        const refreshedData = simulateDataRefresh(window.AppState.data);
        
        // Değişiklik varsa güncelle
        if (hasDataChanged(window.AppState.data, refreshedData)) {
            window.AppState.data = refreshedData;
            handleDataLoaded(refreshedData);
            
            Utils.showNotification('Veriler güncellendi', 'success', 3000);
            
            // Performans uyarılarını kontrol et
            checkPerformanceAlerts();
        }
        
        // Son güncelleme zamanını kaydet
        window.AppState.autoRefresh.lastUpdate = new Date();
        updateRefreshIndicator();
        
    } catch (error) {
        console.error('Otomatik yenileme hatası:', error);
        Utils.showNotification('Veri yenileme hatası', 'error');
    }
}

function simulateDataRefresh(originalData) {
    // Gerçek uygulamada burası API çağrısı olur
    // Şimdilik basit simülasyon yapıyoruz
    
    const refreshedData = originalData.map(record => {
        const newRecord = { ...record };
        
        // %10 ihtimalle yeni işlem ekle
        if (Math.random() < 0.1) {
            newRecord.miktar = (newRecord.miktar || 0) + Math.floor(Math.random() * 5) + 1;
            newRecord.processedAt = new Date();
        }
        
        return newRecord;
    });
    
    // %5 ihtimalle yeni kayıt ekle
    if (Math.random() < 0.05 && originalData.length > 0) {
        const sampleRecord = { ...originalData[0] };
        sampleRecord.islemTarihi = new Date();
        sampleRecord.islemSaati = new Date().toTimeString().slice(0, 5);
        sampleRecord.processedAt = new Date();
        refreshedData.push(sampleRecord);
    }
    
    return refreshedData;
}

function hasDataChanged(oldData, newData) {
    // Basit değişiklik kontrolü
    return oldData.length !== newData.length || 
           JSON.stringify(oldData.slice(-5)) !== JSON.stringify(newData.slice(-5));
}

function updateRefreshIndicator() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (!refreshBtn) return;
    
    const lastUpdate = window.AppState.autoRefresh.lastUpdate;
    const isEnabled = window.AppState.autoRefresh.enabled;
    
    // Buton durumunu güncelle
    if (isEnabled) {
        refreshBtn.classList.add('auto-refresh-active');
        refreshBtn.title = `Otomatik yenileme aktif. Son güncelleme: ${lastUpdate ? lastUpdate.toLocaleTimeString('tr-TR') : 'Henüz yok'}`;
    } else {
        refreshBtn.classList.remove('auto-refresh-active');
        refreshBtn.title = 'Otomatik yenileme pasif. Tıklayarak manuel yenileyin.';
    }
    
    // Refresh indicator ekle
    let indicator = refreshBtn.querySelector('.refresh-indicator');
    if (!indicator && isEnabled) {
        indicator = document.createElement('div');
        indicator.className = 'refresh-indicator';
        refreshBtn.appendChild(indicator);
    } else if (indicator && !isEnabled) {
        indicator.remove();
    }
}

// Performans uyarı sistemi
function checkPerformanceAlerts() {
    if (!window.AppState.processedData) return;
    
    const personnel = window.AppState.processedData.personnel;
    const thresholds = window.AppState.performance.thresholds;
    const alerts = [];
    
    personnel.forEach(person => {
        const score = person.performanceScore || 0;
        
        // Düşük performans uyarısı
        if (score < thresholds.warning) {
            alerts.push({
                type: 'warning',
                title: 'Düşük Performans',
                message: `${person.name} performansı ${score}% (${thresholds.warning}% altında)`,
                personnel: person.name,
                timestamp: new Date()
            });
        }
        
        // Yüksek performans tebriği
        if (score >= thresholds.excellent) {
            alerts.push({
                type: 'success',
                title: 'Mükemmel Performans',
                message: `${person.name} mükemmel performans gösteriyor: ${score}%`,
                personnel: person.name,
                timestamp: new Date()
            });
        }
    });
    
    // Yeni uyarıları göster
    alerts.forEach(alert => {
        if (!isAlertShown(alert)) {
            showPerformanceAlert(alert);
            window.AppState.performance.alerts.push(alert);
        }
    });
    
    // Eski uyarıları temizle (1 saatten eski)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    window.AppState.performance.alerts = window.AppState.performance.alerts.filter(
        alert => alert.timestamp > oneHourAgo
    );
}

function isAlertShown(newAlert) {
    return window.AppState.performance.alerts.some(alert => 
        alert.personnel === newAlert.personnel && 
        alert.type === newAlert.type &&
        (new Date() - alert.timestamp) < 30 * 60 * 1000 // 30 dakika içinde aynı uyarı
    );
}

function showPerformanceAlert(alert) {
    Utils.showNotification(
        `${alert.title}: ${alert.message}`,
        alert.type,
        alert.type === 'success' ? 5000 : 8000
    );
    
    // Personeli listede vurgula
    highlightPersonnelInList(alert.personnel, alert.type);
}

function highlightPersonnelInList(personnelName, alertType) {
    const personnelItem = document.querySelector(`[data-personnel="${personnelName}"]`);
    if (!personnelItem) return;
    
    // Geçici vurgulama efekti
    personnelItem.classList.add(`alert-${alertType}`);
    
    setTimeout(() => {
        personnelItem.classList.remove(`alert-${alertType}`);
    }, 5000);
}

// Otomatik yenileme toggle
function toggleAutoRefresh() {
    if (window.AppState.autoRefresh.enabled) {
        stopAutoRefresh();
        Utils.showNotification('Otomatik yenileme durduruldu', 'info');
    } else {
        window.AppState.autoRefresh.enabled = true;
        startAutoRefresh();
        Utils.showNotification('Otomatik yenileme başlatıldı', 'success');
    }
}

// Modern personel grid'ini güncelle
function updatePersonnelGrid(personnel) {
    const personnelGrid = document.getElementById('personnel-grid');
    if (!personnelGrid || !personnel) return;
    
    console.log('📊 Personel grid güncelleniyor:', personnel.length, 'personel');
    
    personnelGrid.innerHTML = '';
    
    // Personeli performansa göre sırala
    const sortedPersonnel = [...personnel].sort((a, b) => {
        return (b.performanceScore || 0) - (a.performanceScore || 0);
    });
    
    sortedPersonnel.forEach((person, index) => {
        const card = createModernPersonnelCard(person, index);
        personnelGrid.appendChild(card);
    });
    
    // İlk personeli seç
    if (sortedPersonnel.length > 0) {
        selectPersonnel(sortedPersonnel[0].name);
    }
}

function createModernPersonnelCard(person, index) {
    const card = document.createElement('div');
    card.className = 'personnel-card';
    card.dataset.personnel = person.name;
    
    const performanceColor = Utils.getPerformanceColor(person.performanceScore || 0);
    const performanceLevel = getPerformanceLevel(person.performanceScore || 0);
    
    // Rank badge sadece top 3 için
    const isTopPerformer = index < 3;
    const rankBadge = isTopPerformer ? `<div class="rank-badge rank-${index + 1}">#${index + 1}</div>` : '';
    
    card.innerHTML = `
        ${rankBadge}
        <div class="personnel-card-header">
            <div class="personnel-avatar-modern">
                <div class="avatar-modern">${getInitials(person.name)}</div>
            </div>
            <div class="personnel-card-info">
                <h4>${person.name}</h4>
                <p class="personnel-card-role">${performanceLevel.text} Performans</p>
            </div>
        </div>
        
        <div class="personnel-card-stats">
            <div class="personnel-stat">
                <span class="personnel-stat-value">${(person.totalWorkHours || 0).toFixed(0)}</span>
                <span class="personnel-stat-label">Saat</span>
            </div>
            <div class="personnel-stat">
                <span class="personnel-stat-value">${person.totalTransactions || 0}</span>
                <span class="personnel-stat-label">İşlem</span>
            </div>
        </div>
        
        <div class="personnel-card-performance">
            <div class="performance-bar-modern">
                <div class="performance-fill-modern" style="width: ${person.performanceScore || 0}%"></div>
            </div>
            <span class="performance-score-modern">${(person.performanceScore || 0).toFixed(0)}%</span>
        </div>
    `;
    
    // Tıklama olayı
    card.addEventListener('click', () => {
        selectPersonnel(person.name);
    });
    
    return card;
}

// Sidebar'ı güncelle
function updateSidebar(data) {
    updateQuickStats(data);
    updateTopPerformersCompact(data.personnel);
    updateQuantityLeadersCompact(data.personnel);
}

function updateQuickStats(data) {
    const container = document.getElementById('quick-stats');
    if (!container) return;
    
    const stats = [
        { label: 'Aktif Personel', value: data.personnel.filter(p => p.isActive).length },
        { label: 'Toplam İşlem', value: data.totalTransactions.toLocaleString('tr-TR') },
        { label: 'Ortalama Performans', value: Math.round(data.personnel.reduce((sum, p) => sum + (p.performanceScore || 0), 0) / data.personnel.length) + '%' },
        { label: 'Aktif Proje', value: data.warehouses.length }
    ];
    
    container.innerHTML = stats.map(stat => `
        <div class="quick-stat-item">
            <span class="quick-stat-label">${stat.label}</span>
            <span class="quick-stat-value">${stat.value}</span>
        </div>
    `).join('');
}

function updateTopPerformersCompact(personnel) {
    const container = document.getElementById('top-performers-list');
    if (!container) return;
    
    const topPerformers = [...personnel]
        .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
        .slice(0, 3);
    
    container.innerHTML = topPerformers.map((person, index) => `
        <div class="top-list-item" onclick="selectPersonnel('${person.name}')">
            <div class="top-list-info">
                <div class="top-list-rank rank-${index + 1}">${index + 1}</div>
                <div class="top-list-name">${person.name}</div>
            </div>
            <div class="top-list-value">${(person.performanceScore || 0).toFixed(0)}%</div>
        </div>
    `).join('');
}

function updateQuantityLeadersCompact(personnel) {
    const container = document.getElementById('quantity-leaders-list');
    if (!container) return;
    
    const quantityLeaders = [...personnel]
        .filter(person => (person.totalQuantity || 0) > 0)
        .sort((a, b) => (b.totalQuantity || 0) - (a.totalQuantity || 0))
        .slice(0, 3);
    
    container.innerHTML = quantityLeaders.map((person, index) => `
        <div class="top-list-item" onclick="selectPersonnel('${person.name}')">
            <div class="top-list-info">
                <div class="top-list-rank rank-${index + 1}">${index + 1}</div>
                <div class="top-list-name">${person.name}</div>
            </div>
            <div class="top-list-value">${Math.round(person.totalQuantity || 0).toLocaleString('tr-TR')}</div>
        </div>
    `).join('');
}

// Summary listelerini güncelle
function updateSummaryLists(data) {
    if (!data || !data.personnel) return;
    
    // Top performers (performans skoruna göre)
    const topPerformers = [...data.personnel]
        .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
        .slice(0, 5);
    
    // Quantity leaders (toplam miktar işlemlerine göre)
    const quantityLeaders = [...data.personnel]
        .filter(person => (person.totalQuantity || 0) > 0) // Sadece miktar işlemi olanlar
        .sort((a, b) => (b.totalQuantity || 0) - (a.totalQuantity || 0))
        .slice(0, 5);
    
    // Top performers listesini doldur
    updateTopPerformersList(topPerformers);
    
    // Quantity leaders listesini doldur
    updateQuantityLeadersList(quantityLeaders);
}

function updateTopPerformersList(performers) {
    const container = document.getElementById('top-performers-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    performers.forEach((person, index) => {
        const item = document.createElement('div');
        item.className = 'summary-item';
        item.onclick = () => selectPersonnel(person.name);
        
        const rank = index + 1;
        const score = (person.performanceScore || 0).toFixed(0);
        
        item.innerHTML = `
            <div class="summary-item-info">
                <div class="summary-rank rank-${rank <= 3 ? rank : 'default'}">${rank}</div>
                <div class="summary-name">${person.name}</div>
            </div>
            <div class="summary-value">${score}%</div>
        `;
        
        container.appendChild(item);
    });
}

function updateQuantityLeadersList(leaders) {
    const container = document.getElementById('quantity-leaders-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    leaders.forEach((person, index) => {
        const item = document.createElement('div');
        item.className = 'summary-item';
        item.onclick = () => selectPersonnel(person.name);
        
        const rank = index + 1;
        const quantity = Math.round(person.totalQuantity || 0).toLocaleString('tr-TR');
        
        item.innerHTML = `
            <div class="summary-item-info">
                <div class="summary-rank rank-${rank <= 3 ? rank : 'default'}">${rank}</div>
                <div class="summary-name">${person.name}</div>
            </div>
            <div class="summary-value">${quantity}</div>
        `;
        
        container.appendChild(item);
    });
}

// Summary listelerinde personeli vurgula
function highlightPersonnelInSummary(personnelName) {
    // Tüm summary item'lardan active class'ını kaldır
    document.querySelectorAll('.summary-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Seçili personeli vurgula
    document.querySelectorAll('.summary-item').forEach(item => {
        const nameElement = item.querySelector('.summary-name');
        if (nameElement && nameElement.textContent === personnelName) {
            item.classList.add('active');
        }
    });
}

// Debug panel toggle
function toggleDebug() {
    if (window.DebugHelper) {
        if (window.DebugHelper.isVisible) {
            window.DebugHelper.hide();
        } else {
            window.DebugHelper.show();
            window.DebugHelper.log('Debug paneli açıldı', 'info');
            
            // Mevcut durumu logla
            window.DebugHelper.log('=== DASHBOARD DURUM RAPORU ===', 'info');
            
            // AppState kontrolü
            if (window.AppState) {
                window.DebugHelper.log(`AppState: OK`, 'success');
                
                if (window.AppState.data) {
                    window.DebugHelper.log(`Ham veri: ${window.AppState.data.length} kayıt`, 'success');
                } else {
                    window.DebugHelper.log(`Ham veri: YOK`, 'warning');
                }
                
                if (window.AppState.processedData) {
                    const pd = window.AppState.processedData;
                    window.DebugHelper.log(`İşlenmiş veri: OK`, 'success');
                    window.DebugHelper.log(`- Personel: ${pd.personnel ? pd.personnel.length : 0}`, 'info');
                    window.DebugHelper.log(`- Depo: ${pd.warehouses ? pd.warehouses.length : 0}`, 'info');
                    window.DebugHelper.log(`- Hareket tipi: ${pd.movementTypes ? pd.movementTypes.length : 0}`, 'info');
                    window.DebugHelper.log(`- Toplam işlem: ${pd.totalTransactions || 0}`, 'info');
                } else {
                    window.DebugHelper.log(`İşlenmiş veri: YOK`, 'warning');
                }
            } else {
                window.DebugHelper.log(`AppState: YOK`, 'error');
            }
            
            // DOM elementleri kontrolü
            const elements = [
                'upload-section',
                'dashboard-content', 
                'total-personnel',
                'daily-transactions',
                'personnel-list'
            ];
            
            window.DebugHelper.log('=== DOM ELEMENT KONTROLÜ ===', 'info');
            elements.forEach(id => {
                const element = document.getElementById(id);
                window.DebugHelper.log(`${id}: ${element ? 'OK' : 'HATA'}`, element ? 'success' : 'error');
            });
            
            // Modül kontrolü
            window.DebugHelper.log('=== MODÜL KONTROLÜ ===', 'info');
            const modules = [
                { name: 'Utils', obj: typeof Utils !== 'undefined' },
                { name: 'ExcelParser', obj: typeof window.ExcelParser !== 'undefined' },
                { name: 'DataProcessor', obj: typeof window.DataProcessor !== 'undefined' },
                { name: 'ChartManager', obj: typeof window.ChartManager !== 'undefined' }
            ];
            
            modules.forEach(module => {
                window.DebugHelper.log(`${module.name}: ${module.obj ? 'OK' : 'HATA'}`, module.obj ? 'success' : 'error');
            });
        }
    } else {
        console.error('DebugHelper yüklenmedi!');
        alert('DebugHelper yüklenmedi! Sayfayı yenileyin.');
    }
}

// ===== GitHub Ayarları Fonksiyonları =====

function toggleGitHubSettings() {
    const content = document.getElementById('github-settings-content');
    const icon = document.getElementById('github-toggle-icon');
    const text = document.getElementById('github-toggle-text');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▲';
        text.textContent = 'Kapat';
        loadGitHubSettingsToUI();
    } else {
        content.style.display = 'none';
        icon.textContent = '▼';
        text.textContent = 'Ayarlar';
    }
}

function loadGitHubSettingsToUI() {
    const settings = DataFetcher.loadSettings();
    
    document.getElementById('github-url-input').value = settings.githubUrl || '';
    document.getElementById('auto-refresh-checkbox').checked = settings.autoRefresh;
    document.getElementById('refresh-interval').value = settings.refreshInterval;
    
    if (settings.lastFetch) {
        document.getElementById('last-fetch-info').style.display = 'block';
        document.getElementById('last-fetch-time').textContent = DataFetcher.getLastFetchTime();
    }
}

function saveGitHubSettings() {
    const url = document.getElementById('github-url-input').value.trim();
    const autoRefresh = document.getElementById('auto-refresh-checkbox').checked;
    const interval = parseInt(document.getElementById('refresh-interval').value);
    
    if (!url) {
        Utils.showNotification('Lütfen GitHub URL girin', 'warning');
        return;
    }
    
    // URL formatını kontrol et
    if (!url.includes('github') && !url.startsWith('http')) {
        Utils.showNotification('Geçersiz URL formatı', 'error');
        return;
    }
    
    DataFetcher.saveSettings(url, autoRefresh, interval);
    
    if (autoRefresh) {
        DataFetcher.startAutoRefresh();
        Utils.showNotification('✅ Ayarlar kaydedildi ve otomatik yenileme başlatıldı', 'success');
    } else {
        DataFetcher.stopAutoRefresh();
        Utils.showNotification('✅ Ayarlar kaydedildi', 'success');
    }
}

async function loadFromGitHub() {
    try {
        console.log('🔍 loadFromGitHub çağrıldı');
        
        // Modül kontrolü
        if (!window.DataFetcher) {
            console.error('❌ DataFetcher yüklenmedi!');
            alert('DataFetcher modülü yüklenmedi. Sayfayı yenileyin.');
            return;
        }
        
        if (!window.Utils) {
            console.error('❌ Utils yüklenmedi!');
            alert('Utils modülü yüklenmedi. Sayfayı yenileyin.');
            return;
        }
        
        console.log('✅ Modüller yüklü, veri çekiliyor...');
        await DataFetcher.loadFromGitHub();
        
        // Son çekme zamanını güncelle
        const lastFetchInfo = document.getElementById('last-fetch-info');
        const lastFetchTime = document.getElementById('last-fetch-time');
        
        if (lastFetchInfo && lastFetchTime) {
            lastFetchInfo.style.display = 'block';
            lastFetchTime.textContent = DataFetcher.getLastFetchTime();
        }
        
        console.log('✅ Veri çekme tamamlandı');
        
    } catch (error) {
        console.error('❌ GitHub yükleme hatası:', error);
        alert('Veri çekme hatası: ' + error.message);
    }
}

// ===== Tarih Seçici Fonksiyonları =====

function toggleDateSelector() {
    const wrapper = document.getElementById('date-selector-wrapper');
    
    if (!window.AppState || !window.AppState.processedData) {
        Utils.showNotification('Önce veri yükleyin', 'warning');
        return;
    }
    
    if (wrapper.style.display === 'none') {
        wrapper.style.display = 'block';
        DateSelector.loadAllData(window.AppState.processedData);
    } else {
        wrapper.style.display = 'none';
    }
}

// ===== Sayfa Yüklendiğinde =====

// Sayfa yüklendiğinde GitHub ayarlarını kontrol et
document.addEventListener('DOMContentLoaded', function() {
    // GitHub ayarlarını yükle
    const settings = DataFetcher.loadSettings();
    
    // Eğer URL varsa ve otomatik yenileme açıksa, başlat
    if (settings.githubUrl && settings.autoRefresh) {
        console.log('🔄 Otomatik yenileme aktif');
        DataFetcher.startAutoRefresh();
        
        // İlk yükleme yap
        setTimeout(() => {
            loadFromGitHub();
        }, 2000);
    }
});


// ===== Ekran Geçişleri =====

function showUploadSection() {
    const uploadSection = document.getElementById('upload-section');
    const dashboardContent = document.getElementById('dashboard-content');
    const dateSelectorWrapper = document.getElementById('date-selector-wrapper');
    
    if (uploadSection && dashboardContent) {
        // Dashboard'u gizle
        dashboardContent.style.display = 'none';
        
        // Tarih seçiciyi gizle
        if (dateSelectorWrapper) {
            dateSelectorWrapper.style.display = 'none';
        }
        
        // Upload section'ı göster
        uploadSection.style.display = 'flex';
        
        console.log('✅ Dosya yükleme ekranına dönüldü');
    }
}


// ===== GitHub Tarih Seçici =====

async function toggleGitHubDateSelector() {
    const wrapper = document.getElementById('github-date-selector-wrapper');
    const container = document.getElementById('github-date-selector-container');
    
    if (!wrapper || !container) {
        console.error('❌ GitHub tarih seçici elementleri bulunamadı');
        return;
    }
    
    if (wrapper.style.display === 'none') {
        // Aç
        wrapper.style.display = 'block';
        container.innerHTML = '<div class="loading">🔄 GitHub dosyaları yükleniyor...</div>';
        
        try {
            const html = await GitHubFolderBrowser.renderDateTable();
            container.innerHTML = html;
        } catch (error) {
            container.innerHTML = `<div class="error-message">❌ Hata: ${error.message}</div>`;
        }
    } else {
        // Kapat
        wrapper.style.display = 'none';
    }
}
