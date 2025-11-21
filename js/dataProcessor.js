// Veri işleme ve analiz motoru

class DataProcessor {
    constructor() {
        this.rawData = null;
        this.processedData = null;
        this.validationRules = {
            personel: {
                required: true,
                minLength: 2,
                maxLength: 100
            },
            islemTarihi: {
                required: true,
                type: 'date'
            },
            islemSaati: {
                required: true,
                type: 'time'
            },
            miktar: {
                type: 'number',
                min: 0
            }
        };
    }

    // Ana veri işleme fonksiyonu
    async processData(rawData) {
        try {
            console.log('📊 DataProcessor.processData başlatılıyor...', rawData ? rawData.length : 'undefined', 'kayıt');
            console.log('📊 Ham veri örneği:', rawData ? rawData.slice(0, 2) : 'undefined');
            
            // Debug helper'a da logla
            if (window.DebugHelper) {
                window.DebugHelper.log(`DataProcessor başlatılıyor: ${rawData ? rawData.length : 0} kayıt`, 'info');
                if (rawData && rawData.length > 0) {
                    window.DebugHelper.log(`Ham veri örneği: ${JSON.stringify(rawData[0])}`, 'info');
                }
            }
            
            if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
                if (window.DebugHelper) {
                    window.DebugHelper.log('❌ Geçersiz veri: Boş veya geçersiz array', 'error');
                }
                throw new Error('Geçersiz veri: Boş veya geçersiz array');
            }
            
            this.rawData = rawData;
            
            // Büyük dosya kontrolü
            const isLargeFile = rawData.length > 5000;
            console.log(`📊 Dosya boyutu: ${rawData.length} kayıt ${isLargeFile ? '(BÜYÜK DOSYA)' : '(NORMAL)'}`);
            
            // 1. Veri temizleme ve doğrulama
            Utils.showLoading('Veriler temizleniyor...');
            const cleanedData = isLargeFile ? 
                await this.cleanAndValidateDataAsync(rawData) : 
                this.cleanAndValidateData(rawData);
            console.log('Temizlenen veri:', cleanedData.length, 'kayıt');
            
            // 2. Personel bazlı analiz
            Utils.showLoading('Personel analizi yapılıyor...');
            const personnelAnalysis = isLargeFile ? 
                await this.analyzePersonnelDataAsync(cleanedData) : 
                this.analyzePersonnelData(cleanedData);
            console.log('Personel analizi:', personnelAnalysis.length, 'personel');
            
            // 3. Proje analizi
            Utils.showLoading('Proje analizi yapılıyor...');
            const warehouseAnalysis = this.analyzeWarehouseData(cleanedData);
            console.log('Proje analizi:', warehouseAnalysis.length, 'proje');
            
            // 4. Hareket tipi analizi
            Utils.showLoading('Hareket tipleri analiz ediliyor...');
            const movementAnalysis = this.analyzeMovementTypes(cleanedData);
            console.log('Hareket tipi analizi:', Object.keys(movementAnalysis).length, 'tip');
            
            // 5. Zaman bazlı analiz
            Utils.showLoading('Zaman analizi yapılıyor...');
            const timeAnalysis = this.analyzeTimeData(cleanedData);
            console.log('Zaman analizi tamamlandı');
            
            // 6. Genel istatistikler
            Utils.showLoading('İstatistikler hesaplanıyor...');
            const statistics = this.calculateStatistics(cleanedData);
            console.log('İstatistikler hesaplandı');
            
            // Sonuçları birleştir
            this.processedData = {
                rawData: cleanedData,
                personnel: personnelAnalysis,
                warehouses: warehouseAnalysis,
                movementTypes: movementAnalysis,
                timeAnalysis: timeAnalysis,
                statistics: statistics,
                totalRecords: cleanedData.length,
                totalPersonnel: personnelAnalysis.length,
                totalWarehouses: warehouseAnalysis.length,
                averageWorkHours: this.calculateAverageWorkHours(personnelAnalysis),
                totalTransactions: cleanedData.length, // İşlem sayısı
                totalQuantity: this.calculateTotalQuantity(cleanedData), // Toplam miktar
                processedAt: new Date()
            };
            
            console.log('Veri işleme tamamlandı');
            return this.processedData;
            
        } catch (error) {
            console.error('Veri işleme hatası:', error);
            
            // Stack overflow hatası için özel mesaj
            if (error.message.includes('Maximum call stack size exceeded')) {
                console.error('❌ Stack overflow hatası - dosya çok büyük veya karmaşık');
                if (window.DebugHelper) {
                    window.DebugHelper.log('❌ Stack overflow hatası - dosya çok büyük', 'error');
                }
                throw new Error('Dosya çok büyük veya karmaşık. Lütfen daha küçük bir dosya deneyin veya veriyi basitleştirin.');
            }
            
            throw new Error(`Veri işleme hatası: ${error.message}`);
        }
    }

    // Veri temizleme ve doğrulama
    cleanAndValidateData(data) {
        const cleanedData = [];
        const errors = [];
        
        data.forEach((record, index) => {
            try {
                // Veri doğrulaması
                const validationResult = this.validateRecord(record, index);
                
                if (validationResult.isValid) {
                    // Veri temizleme
                    const cleanedRecord = this.cleanRecord(record);
                    cleanedData.push(cleanedRecord);
                } else {
                    errors.push({
                        index: index,
                        errors: validationResult.errors
                    });
                }
                
            } catch (error) {
                errors.push({
                    index: index,
                    errors: [`İşleme hatası: ${error.message}`]
                });
            }
        });
        
        // Hata raporu
        if (errors.length > 0) {
            console.warn(`${errors.length} kayıt hata içeriyor:`, errors.slice(0, 5));
        }
        
        return cleanedData;
    }

    // Async veri temizleme (büyük dosyalar için)
    async cleanAndValidateDataAsync(data) {
        const cleanedData = [];
        const errors = [];
        const batchSize = 500; // Stack overflow önlemek için küçültüldü
        const totalRecords = data.length;
        
        console.log(`📊 Async veri temizleme başlatılıyor: ${totalRecords} kayıt`);
        
        for (let i = 0; i < totalRecords; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchNumber = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(totalRecords / batchSize);
            
            console.log(`📊 Temizleme batch ${batchNumber}/${totalBatches}...`);
            
            batch.forEach((record, batchIndex) => {
                const index = i + batchIndex;
                
                try {
                    // Hızlı validasyon
                    if (this.quickValidate(record)) {
                        const cleanedRecord = this.cleanRecord(record);
                        cleanedData.push(cleanedRecord);
                    }
                } catch (error) {
                    if (errors.length < 100) { // Sadece ilk 100 hatayı sakla
                        errors.push({
                            index: index,
                            errors: [`İşleme hatası: ${error.message}`]
                        });
                    }
                }
            });
            
            // UI donmaması için kısa bekleme
            if (batchNumber < totalBatches) {
                await this.sleep(20); // Stack overflow önlemek için artırıldı
            }
        }
        
        if (errors.length > 0) {
            console.warn(`${errors.length} kayıt hata içeriyor (ilk 100 gösteriliyor):`, errors.slice(0, 5));
        }
        
        return cleanedData;
    }

    // Hızlı validasyon
    quickValidate(record) {
        return record && 
               record.personel && 
               record.personel.length >= 2 && 
               record.islemTarihi && 
               record.islemSaati;
    }

    // Sleep fonksiyonu
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Kayıt doğrulaması
    validateRecord(record, index) {
        const errors = [];
        
        // Her kural için kontrol
        for (const [field, rules] of Object.entries(this.validationRules)) {
            const value = record[field];
            
            // Zorunlu alan kontrolü
            if (rules.required && (!value || value.toString().trim() === '')) {
                errors.push(`${field} alanı zorunludur`);
                continue;
            }
            
            // Değer varsa tip kontrolü
            if (value) {
                // Minimum uzunluk
                if (rules.minLength && value.toString().length < rules.minLength) {
                    errors.push(`${field} minimum ${rules.minLength} karakter olmalıdır`);
                }
                
                // Maksimum uzunluk
                if (rules.maxLength && value.toString().length > rules.maxLength) {
                    errors.push(`${field} maksimum ${rules.maxLength} karakter olmalıdır`);
                }
                
                // Sayı kontrolü
                if (rules.type === 'number') {
                    const num = parseFloat(value);
                    if (isNaN(num)) {
                        errors.push(`${field} geçerli bir sayı olmalıdır`);
                    } else {
                        if (rules.min !== undefined && num < rules.min) {
                            errors.push(`${field} minimum ${rules.min} olmalıdır`);
                        }
                        if (rules.max !== undefined && num > rules.max) {
                            errors.push(`${field} maksimum ${rules.max} olmalıdır`);
                        }
                    }
                }
                
                // Tarih kontrolü
                if (rules.type === 'date') {
                    const date = new Date(value);
                    if (isNaN(date.getTime())) {
                        errors.push(`${field} geçerli bir tarih olmalıdır`);
                    }
                }
                
                // Saat kontrolü
                if (rules.type === 'time') {
                    if (!this.isValidTime(value)) {
                        errors.push(`${field} geçerli bir saat formatı olmalıdır (HH:MM)`);
                    }
                }
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Saat formatı kontrolü
    isValidTime(timeStr) {
        if (!timeStr) return false;
        
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(timeStr.toString());
    }

    // Kayıt temizleme (basitleştirilmiş - stack overflow önleme)
    cleanRecord(record) {
        const cleaned = { ...record };
        
        // Sadece temel temizlik (performans için)
        if (cleaned.personel) {
            cleaned.personel = cleaned.personel.toString().trim();
        }
        if (cleaned.proje) {
            cleaned.proje = cleaned.proje.toString().trim();
        }
        if (cleaned.hareketTipi) {
            cleaned.hareketTipi = cleaned.hareketTipi.toString().trim();
        }
        
        // Sayısal alanları normalize et
        if (cleaned.miktar) {
            cleaned.miktar = Math.max(0, parseFloat(cleaned.miktar) || 0);
        }
        
        // Sadece temel tarih alanları
        if (cleaned.islemTarihi && !(cleaned.islemTarihi instanceof Date)) {
            const date = new Date(cleaned.islemTarihi);
            if (!isNaN(date.getTime())) {
                cleaned.islemTarihi = date;
            }
        }
        
        return cleaned;
    }

    // Personel bazlı analiz
    analyzePersonnelData(data) {
        console.log('📊 analyzePersonnelData başlatılıyor, kayıt sayısı:', data.length);
        console.log('📊 İlk 3 kayıt örneği:', data.slice(0, 3));
        
        const personnelMap = new Map();
        let validPersonnelCount = 0;
        let invalidPersonnelCount = 0;
        
        data.forEach((record, index) => {
            const personnelName = record.personel;
            
            if (!personnelName || personnelName.toString().trim() === '') {
                invalidPersonnelCount++;
                if (index < 5) { // İlk 5 geçersiz kaydı logla
                    console.log(`⚠️ Kayıt ${index}: Personel adı boş veya geçersiz:`, record);
                }
                return; // Boş personel adını atla
            }
            
            validPersonnelCount++;
            const cleanPersonnelName = personnelName.toString().trim();
            
            if (!personnelMap.has(cleanPersonnelName)) {
                personnelMap.set(cleanPersonnelName, {
                    name: cleanPersonnelName,
                    transactions: [],
                    workDays: new Set(),
                    warehouses: new Set(),
                    movementTypes: new Map(),
                    totalTransactions: 0,
                    totalQuantity: 0, // Toplam miktar
                    totalWorkHours: 0,
                    averageWorkHours: 0,
                    performanceScore: 0,
                    isActive: false,
                    firstTransaction: null,
                    lastTransaction: null
                });
            }
            
            const personnel = personnelMap.get(cleanPersonnelName);
            
            // İşlem ekle
            personnel.transactions.push(record);
            personnel.totalTransactions++;
            
            // Miktar ekle
            const quantity = parseFloat(record.miktar) || 0;
            personnel.totalQuantity += quantity;
            
            // Çalışma günü ekle
            if (record.islemTarihi) {
                const dateStr = record.islemTarihi.toDateString();
                personnel.workDays.add(dateStr);
                
                // İlk ve son işlem tarihleri
                if (!personnel.firstTransaction || record.islemTarihi < personnel.firstTransaction) {
                    personnel.firstTransaction = record.islemTarihi;
                }
                if (!personnel.lastTransaction || record.islemTarihi > personnel.lastTransaction) {
                    personnel.lastTransaction = record.islemTarihi;
                }
            }
            
            // Proje ekle
            if (record.proje) {
                personnel.warehouses.add(record.proje);
            }
            
            // Hareket tipi sayısını artır
            const movementType = record.hareketTipiKategori || 'Diğer';
            personnel.movementTypes.set(
                movementType, 
                (personnel.movementTypes.get(movementType) || 0) + 1
            );
        });
        
        // Personel istatistiklerini hesapla
        const personnelArray = Array.from(personnelMap.values()).map(personnel => {
            // Gerçek çalışma saati hesaplama (işlem sayısı ve gün sayısına göre)
            personnel.actualWorkHours = this.calculateWorkHoursFromActivity(personnel);
            personnel.totalWorkHours = personnel.actualWorkHours;
            personnel.averageWorkHours = personnel.workDays.size > 0 ? 
                personnel.actualWorkHours / personnel.workDays.size : 0;
            
            // Aktiflik durumu (son 7 gün içinde işlem var mı)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            personnel.isActive = personnel.lastTransaction && 
                personnel.lastTransaction >= sevenDaysAgo;
            
            // Performans skoru hesaplama
            personnel.performanceScore = this.calculatePersonnelPerformance(personnel);
            
            // Hareket tiplerini array'e çevir
            personnel.movementTypesArray = Array.from(personnel.movementTypes.entries())
                .map(([type, count]) => ({ type, count }))
                .sort((a, b) => b.count - a.count);
            
            // Projeleri array'e çevir
            personnel.warehousesArray = Array.from(personnel.warehouses);
            
            return personnel;
        });
        
        console.log(`📊 Personel analizi tamamlandı:`);
        console.log(`   - Geçerli personel kayıtları: ${validPersonnelCount}`);
        console.log(`   - Geçersiz personel kayıtları: ${invalidPersonnelCount}`);
        console.log(`   - Bulunan unique personel: ${personnelArray.length}`);
        
        if (personnelArray.length === 0) {
            console.error('❌ Hiç personel bulunamadı! Veri örnekleri:');
            
            // Debug helper'a detaylı hata bilgisi logla
            if (window.DebugHelper) {
                window.DebugHelper.log('❌ Hiç personel bulunamadı!', 'error');
                window.DebugHelper.log(`Toplam kayıt: ${data.length}`, 'info');
                window.DebugHelper.log(`Geçerli personel kayıtları: ${validPersonnelCount}`, 'info');
                window.DebugHelper.log(`Geçersiz personel kayıtları: ${invalidPersonnelCount}`, 'warning');
            }
            
            data.slice(0, 5).forEach((record, index) => {
                console.log(`   Kayıt ${index}:`, {
                    personel: record.personel,
                    keys: Object.keys(record)
                });
                
                // Debug helper'a da logla
                if (window.DebugHelper) {
                    window.DebugHelper.log(`Kayıt ${index}: personel="${record.personel}", keys=[${Object.keys(record).join(', ')}]`, 'info');
                }
            });
        }
        
        // Performansa göre sırala
        return personnelArray.sort((a, b) => b.performanceScore - a.performanceScore);
    }

    // Async personel analizi (büyük dosyalar için)
    async analyzePersonnelDataAsync(data) {
        console.log('📊 Async analyzePersonnelData başlatılıyor, kayıt sayısı:', data.length);
        
        const personnelMap = new Map();
        let validPersonnelCount = 0;
        let invalidPersonnelCount = 0;
        const batchSize = 1000; // Stack overflow önlemek için küçültüldü
        const totalRecords = data.length;
        
        // Batch'ler halinde personel verilerini işle
        for (let i = 0; i < totalRecords; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchNumber = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(totalRecords / batchSize);
            
            console.log(`📊 Personel analizi batch ${batchNumber}/${totalBatches}...`);
            
            batch.forEach((record, batchIndex) => {
                const personnelName = record.personel;
                
                if (!personnelName || personnelName.toString().trim() === '') {
                    invalidPersonnelCount++;
                    return;
                }
                
                validPersonnelCount++;
                const cleanPersonnelName = personnelName.toString().trim();
                
                if (!personnelMap.has(cleanPersonnelName)) {
                    personnelMap.set(cleanPersonnelName, {
                        name: cleanPersonnelName,
                        transactions: [],
                        workDays: new Set(),
                        warehouses: new Set(),
                        movementTypes: new Map(),
                        totalTransactions: 0,
                        totalQuantity: 0, // Toplam miktar
                        totalWorkHours: 0,
                        averageWorkHours: 0,
                        performanceScore: 0,
                        isActive: false,
                        firstTransaction: null,
                        lastTransaction: null
                    });
                }
                
                const personnel = personnelMap.get(cleanPersonnelName);
                
                // İşlem ekle (büyük dosyalarda transaction array'i tutmayalım, sadece sayıyı tutalım)
                personnel.totalTransactions++;
                
                // Miktar ekle
                const quantity = parseFloat(record.miktar) || 0;
                personnel.totalQuantity += quantity;
                
                // Çalışma günü ekle
                if (record.islemTarihi) {
                    const dateStr = record.islemTarihi.toDateString();
                    personnel.workDays.add(dateStr);
                    
                    // İlk ve son işlem tarihleri
                    if (!personnel.firstTransaction || record.islemTarihi < personnel.firstTransaction) {
                        personnel.firstTransaction = record.islemTarihi;
                    }
                    if (!personnel.lastTransaction || record.islemTarihi > personnel.lastTransaction) {
                        personnel.lastTransaction = record.islemTarihi;
                    }
                }
                
                // Proje ekle
                if (record.proje) {
                    personnel.warehouses.add(record.proje);
                }
                
                // Hareket tipi sayısını artır
                const movementType = record.hareketTipiKategori || 'Diğer';
                personnel.movementTypes.set(
                    movementType, 
                    (personnel.movementTypes.get(movementType) || 0) + 1
                );
            });
            
            // UI donmaması için kısa bekleme
            if (batchNumber < totalBatches) {
                await this.sleep(30); // Stack overflow önlemek için artırıldı
            }
        }
        
        // Personel istatistiklerini hesapla
        const personnelArray = Array.from(personnelMap.values()).map(personnel => {
            // Çalışma saati hesaplama
            personnel.totalWorkHours = personnel.workDays.size * 8;
            personnel.averageWorkHours = personnel.workDays.size > 0 ? 
                personnel.totalWorkHours / personnel.workDays.size : 0;
            
            // Aktiflik durumu
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            personnel.isActive = personnel.lastTransaction && 
                personnel.lastTransaction >= sevenDaysAgo;
            
            // Performans skoru hesaplama
            personnel.performanceScore = this.calculatePersonnelPerformance(personnel);
            
            // Array'lere çevir
            personnel.movementTypesArray = Array.from(personnel.movementTypes.entries())
                .map(([type, count]) => ({ type, count }))
                .sort((a, b) => b.count - a.count);
            
            personnel.warehousesArray = Array.from(personnel.warehouses);
            
            // Transactions array'ini boş bırak (memory tasarrufu)
            personnel.transactions = [];
            
            return personnel;
        });
        
        console.log(`📊 Async personel analizi tamamlandı: ${personnelArray.length} personel`);
        
        // Performansa göre sırala
        return personnelArray.sort((a, b) => b.performanceScore - a.performanceScore);
    }

    // Personel performans skoru hesaplama (geliştirilmiş)
    calculatePersonnelPerformance(personnel) {
        let score = 0;
        
        // 1. Günlük ortalama işlem skoru (50%)
        const dailyAvgTransactions = personnel.workDays.size > 0 ? 
            personnel.totalTransactions / personnel.workDays.size : 0;
        
        // Dinamik benchmark (tüm personelin ortalamasına göre)
        const benchmarkDaily = 25; // Günlük hedef işlem sayısı
        const transactionScore = Math.min(100, (dailyAvgTransactions / benchmarkDaily) * 100);
        score += transactionScore * 0.5;
        
        // 2. Tutarlılık skoru (25%) - düzenli çalışma
        const consistencyScore = personnel.workDays.size >= 5 ? 
            Math.min(100, (personnel.workDays.size / 22) * 100) : // Aylık 22 iş günü
            personnel.workDays.size * 20; // Az çalışanlar için ceza
        score += consistencyScore * 0.25;
        
        // 3. Çeşitlilik ve adaptasyon skoru (15%)
        const diversityScore = Math.min(100, personnel.movementTypes.size * 25);
        score += diversityScore * 0.15;
        
        // 4. Aktiflik ve güncellik skoru (10%)
        const activityScore = personnel.isActive ? 100 : 
            (personnel.lastTransaction && 
             (new Date() - personnel.lastTransaction) / (1000 * 60 * 60 * 24) <= 14) ? 50 : 0; // Son 14 gün
        score += activityScore * 0.1;
        
        // Minimum ve maksimum sınırları
        score = Math.max(0, Math.min(100, score));
        
        return Math.round(score);
    }

    // Proje analizi
    analyzeWarehouseData(data) {
        const warehouseMap = new Map();
        
        data.forEach(record => {
            const warehouseName = record.proje || 'Bilinmeyen';
            
            if (!warehouseMap.has(warehouseName)) {
                warehouseMap.set(warehouseName, {
                    name: warehouseName,
                    totalTransactions: 0,
                    personnel: new Set(),
                    movementTypes: new Map(),
                    dailyActivity: new Map(),
                    averageDailyActivity: 0
                });
            }
            
            const warehouse = warehouseMap.get(warehouseName);
            
            warehouse.totalTransactions++;
            
            if (record.personel) {
                warehouse.personnel.add(record.personel);
            }
            
            // Hareket tipi
            const movementType = record.hareketTipiKategori || 'Diğer';
            warehouse.movementTypes.set(
                movementType,
                (warehouse.movementTypes.get(movementType) || 0) + 1
            );
            
            // Günlük aktivite
            if (record.islemTarihi) {
                const dateStr = record.islemTarihi.toDateString();
                warehouse.dailyActivity.set(
                    dateStr,
                    (warehouse.dailyActivity.get(dateStr) || 0) + 1
                );
            }
        });
        
        // Proje istatistiklerini hesapla
        return Array.from(warehouseMap.values()).map(warehouse => {
            warehouse.personnelCount = warehouse.personnel.size;
            warehouse.averageDailyActivity = warehouse.dailyActivity.size > 0 ?
                warehouse.totalTransactions / warehouse.dailyActivity.size : 0;
            
            // Array'lere çevir
            warehouse.personnelArray = Array.from(warehouse.personnel);
            warehouse.movementTypesArray = Array.from(warehouse.movementTypes.entries())
                .map(([type, count]) => ({ type, count }))
                .sort((a, b) => b.count - a.count);
            
            return warehouse;
        }).sort((a, b) => b.totalTransactions - a.totalTransactions);
    }

    // Hareket tipi analizi
    analyzeMovementTypes(data) {
        const movementMap = new Map();
        
        data.forEach(record => {
            const movementType = record.hareketTipiKategori || 'Diğer';
            
            if (!movementMap.has(movementType)) {
                movementMap.set(movementType, {
                    type: movementType,
                    count: 0,
                    percentage: 0,
                    personnel: new Set(),
                    warehouses: new Set()
                });
            }
            
            const movement = movementMap.get(movementType);
            movement.count++;
            
            if (record.personel) movement.personnel.add(record.personel);
            if (record.proje) movement.warehouses.add(record.proje);
        });
        
        const totalTransactions = data.length;
        const movementArray = Array.from(movementMap.values());
        
        // Yüzdeleri hesapla
        movementArray.forEach(movement => {
            movement.percentage = (movement.count / totalTransactions) * 100;
            movement.personnelCount = movement.personnel.size;
            movement.warehouseCount = movement.warehouses.size;
        });
        
        return movementArray.sort((a, b) => b.count - a.count);
    }

    // Zaman bazlı analiz
    analyzeTimeData(data) {
        const timeAnalysis = {
            hourlyDistribution: new Map(),
            dailyDistribution: new Map(),
            weeklyDistribution: new Map(),
            monthlyDistribution: new Map()
        };
        
        data.forEach(record => {
            // Saatlik dağılım
            if (record.islemSaati) {
                const hour = parseInt(record.islemSaati.split(':')[0]);
                timeAnalysis.hourlyDistribution.set(
                    hour,
                    (timeAnalysis.hourlyDistribution.get(hour) || 0) + 1
                );
            }
            
            // Günlük dağılım
            if (record.islemTarihi) {
                const dayOfWeek = record.islemTarihi.getDay();
                timeAnalysis.dailyDistribution.set(
                    dayOfWeek,
                    (timeAnalysis.dailyDistribution.get(dayOfWeek) || 0) + 1
                );
                
                // Haftalık dağılım
                const weekOfYear = this.getWeekOfYear(record.islemTarihi);
                timeAnalysis.weeklyDistribution.set(
                    weekOfYear,
                    (timeAnalysis.weeklyDistribution.get(weekOfYear) || 0) + 1
                );
                
                // Aylık dağılım
                const monthOfYear = record.islemTarihi.getMonth();
                timeAnalysis.monthlyDistribution.set(
                    monthOfYear,
                    (timeAnalysis.monthlyDistribution.get(monthOfYear) || 0) + 1
                );
            }
        });
        
        // Map'leri array'e çevir
        return {
            hourly: Array.from(timeAnalysis.hourlyDistribution.entries())
                .map(([hour, count]) => ({ hour, count }))
                .sort((a, b) => a.hour - b.hour),
            daily: Array.from(timeAnalysis.dailyDistribution.entries())
                .map(([day, count]) => ({ day, count }))
                .sort((a, b) => a.day - b.day),
            weekly: Array.from(timeAnalysis.weeklyDistribution.entries())
                .map(([week, count]) => ({ week, count }))
                .sort((a, b) => a.week - b.week),
            monthly: Array.from(timeAnalysis.monthlyDistribution.entries())
                .map(([month, count]) => ({ month, count }))
                .sort((a, b) => a.month - b.month)
        };
    }

    // Genel istatistikler
    calculateStatistics(data) {
        const stats = {
            totalRecords: data.length,
            uniquePersonnel: new Set(data.map(r => r.personel)).size,
            uniqueWarehouses: new Set(data.map(r => r.proje)).size,
            dateRange: {
                start: null,
                end: null
            },
            averageTransactionsPerPersonnel: 0,
            averageTransactionsPerDay: 0
        };
        
        // Tarih aralığı
        const dates = data.map(r => r.islemTarihi).filter(d => d);
        if (dates.length > 0) {
            stats.dateRange.start = new Date(Math.min(...dates));
            stats.dateRange.end = new Date(Math.max(...dates));
            
            const daysDiff = Math.ceil((stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24)) + 1;
            stats.averageTransactionsPerDay = data.length / daysDiff;
        }
        
        stats.averageTransactionsPerPersonnel = data.length / stats.uniquePersonnel;
        
        return stats;
    }

    // Yardımcı fonksiyonlar
    getWeekOfYear(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    calculateAverageWorkHours(personnel) {
        if (!personnel || personnel.length === 0) return 0;
        const totalHours = personnel.reduce((sum, p) => sum + (p.averageWorkHours || 0), 0);
        return totalHours / personnel.length;
    }

    // Toplam miktar hesaplama
    calculateTotalQuantity(data) {
        if (!data || data.length === 0) return 0;
        
        let total = 0;
        let validCount = 0;
        
        data.forEach((record, index) => {
            const quantity = parseFloat(record.miktar) || 0;
            if (quantity > 0) {
                total += quantity;
                validCount++;
            }
            
            // İlk 5 kaydı debug için logla
            if (index < 5) {
                console.log(`📊 Miktar debug ${index}: "${record.miktar}" -> ${quantity}`);
            }
        });
        
        console.log(`📊 Toplam miktar hesaplandı: ${total} (${validCount}/${data.length} geçerli kayıt)`);
        
        if (window.DebugHelper) {
            window.DebugHelper.log(`Toplam miktar: ${total} (${validCount} geçerli kayıt)`, 'info');
        }
        
        return total;
    }

    // Gerçek çalışma saati hesaplama (işlem saatlerinden)
    calculateActualWorkHours(transactions) {
        if (!transactions || transactions.length === 0) return 0;
        
        // Günlük işlem saatlerini grupla
        const dailyHours = new Map();
        
        transactions.forEach(transaction => {
            if (!transaction.islemTarihi || !transaction.islemSaati) return;
            
            const dateKey = transaction.islemTarihi.toDateString();
            const timeStr = transaction.islemSaati.toString();
            
            // Saat formatını parse et
            let hour = 0;
            if (timeStr.includes(':')) {
                const parts = timeStr.split(':');
                hour = parseInt(parts[0]) || 0;
            } else if (typeof timeStr === 'number') {
                hour = Math.floor(timeStr * 24);
            } else {
                hour = parseInt(timeStr) || 0;
            }
            
            if (!dailyHours.has(dateKey)) {
                dailyHours.set(dateKey, { min: hour, max: hour });
            } else {
                const dayData = dailyHours.get(dateKey);
                dayData.min = Math.min(dayData.min, hour);
                dayData.max = Math.max(dayData.max, hour);
            }
        });
        
        // Her gün için çalışma saatini hesapla
        let totalHours = 0;
        dailyHours.forEach(dayData => {
            const dailyWorkHours = Math.max(1, dayData.max - dayData.min + 1); // En az 1 saat
            totalHours += Math.min(dailyWorkHours, 12); // Maksimum 12 saat/gün
        });
        
        return totalHours;
    }

    // Aktivite bazlı çalışma saati hesaplama
    calculateWorkHoursFromActivity(personnel) {
        if (!personnel.workDays || personnel.workDays.size === 0) return 0;
        
        // İşlem yoğunluğuna göre günlük çalışma saati tahmini
        const avgTransactionsPerDay = personnel.totalTransactions / personnel.workDays.size;
        
        // İşlem sayısına göre çalışma saati hesaplama
        let dailyHours = 0;
        if (avgTransactionsPerDay >= 50) {
            dailyHours = 9; // Yoğun çalışma
        } else if (avgTransactionsPerDay >= 30) {
            dailyHours = 8; // Normal çalışma
        } else if (avgTransactionsPerDay >= 15) {
            dailyHours = 6; // Orta yoğunluk
        } else if (avgTransactionsPerDay >= 5) {
            dailyHours = 4; // Düşük yoğunluk
        } else {
            dailyHours = 2; // Çok düşük
        }
        
        // Toplam çalışma saati
        const totalHours = dailyHours * personnel.workDays.size;
        
        // Debug sadece ilk 3 personel için
        if (personnel.name && personnel.name.length > 0) {
            const firstChar = personnel.name.charAt(0).toLowerCase();
            if (['a', 'b', 'c'].includes(firstChar)) {
                console.log(`📊 ${personnel.name}: ${personnel.totalTransactions} işlem, ${personnel.workDays.size} gün, günlük ort: ${avgTransactionsPerDay.toFixed(1)}, tahmini: ${dailyHours}h/gün, toplam: ${totalHours}h`);
            }
        }
        
        return totalHours;
    }

    // Filtreleme fonksiyonları
    filterByWarehouse(data, warehouse) {
        if (!warehouse) return data;
        return data.filter(record => record.proje === warehouse);
    }

    filterByPersonnel(data, personnel) {
        if (!personnel) return data;
        return data.filter(record => record.personel === personnel);
    }

    filterByDateRange(data, startDate, endDate) {
        return data.filter(record => {
            if (!record.islemTarihi) return false;
            const date = new Date(record.islemTarihi);
            return date >= startDate && date <= endDate;
        });
    }
}

// Global olarak erişilebilir yap
window.DataProcessor = new DataProcessor();