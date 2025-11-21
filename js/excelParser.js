// Excel dosyası okuma ve işleme modülü

class ExcelParser {
    constructor() {
        this.expectedColumns = {
            'proje': ['proje', 'project', 'depo', 'warehouse', 'depo_adi'],
            'digerDepo': ['diger_depo', 'diğer_depo', 'diger depo', 'diğer depo', 'other_warehouse'],
            'skuKodu': ['sku_kodu', 'sku_code', 'sku', 'sku kodu'],
            'skuTanimi': ['sku_tanimi', 'sku_tanımı', 'sku_description', 'sku tanimi', 'sku tanımı'],
            'islemTarihi': ['islem_tarihi', 'işlem_tarihi', 'transaction_date', 'tarih', 'islem tarihi', 'işlem tarihi'],
            'islemSaati': ['islem_saati', 'işlem_saati', 'transaction_time', 'saat', 'islem saati', 'işlem saati'],
            'islemSaatiAnaliz': ['islem_saati_analiz', 'işlem_saati_analiz', 'time_analysis', 'islem saati analiz', 'işlem saati analiz'],
            'personel': ['personel', 'personnel', 'employee', 'calisan', 'çalışan', 'worker', 'staff', 'kişi', 'kisi', 'ad', 'name', 'isim', 'kullanici', 'kullanıcı', 'user', 'operator', 'operatör'],
            'hareketTipi': ['hareket_tipi', 'movement_type', 'hareket', 'hareket tipi'],
            'genelHareketTipi': ['genel_hareket_tipi', 'general_movement_type', 'genel hareket tipi'],
            'miktar': ['miktar', 'quantity', 'amount'],
            'refPalNo': ['ref_pal_no', 'palet_no', 'pallet_no', 'ref.pal.no', 'ref pal no', 'refpalno'],
            'belgeNo': ['belge_no', 'document_no', 'belge', 'belge no'],
            'belgeTarihi': ['belge_tarihi', 'document_date', 'belge tarihi'],
            'uretimTarihi': ['uretim_tarihi', 'üretim_tarihi', 'production_date', 'uretim tarihi', 'üretim tarihi'],
            'irsaliyeNo': ['irsaliye_no', 'waybill_no', 'irsaliye no'],
            'adres': ['adres', 'address']
        };
        
        this.columnMapping = {};
        this.rawData = null;
        this.processedData = null;
    }

    // Ana dosya okuma fonksiyonu
    async parseFile(file) {
        try {
            console.log('Dosya okunuyor:', file.name, file.type);
            
            let jsonData;
            
            // CSV dosyası kontrolü
            if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
                console.log('CSV dosyası tespit edildi');
                const text = await this.readFileAsText(file);
                jsonData = this.parseCSV(text);
            } else {
                // Excel dosyası
                console.log('Excel dosyası tespit edildi');
                const data = await this.readFileAsArrayBuffer(file);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // İlk sheet'i al
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                // JSON'a çevir - Performans optimizasyonu
                jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                    header: 1,
                    defval: '',
                    raw: false,
                    range: 0 // Tüm veriyi oku ama optimize et
                });
            }
            
            if (jsonData.length === 0) {
                throw new Error('Excel dosyası boş veya okunamıyor');
            }
            
            // Header'ları al ve eşleştir
            const headers = jsonData[0];
            
            // Ham başlıkları sakla (hata mesajları için)
            this.rawHeaders = {};
            headers.forEach((header, index) => {
                if (header) {
                    this.rawHeaders[header] = index;
                }
            });
            
            // Debug bilgilerini göster
            this.debugColumnMapping(headers);
            
            this.mapColumns(headers);
            
            // Veriyi işle
            console.log('📊 Ham Excel verisi işleniyor...', jsonData.length - 1, 'satır');
            
            // Debug helper'a da logla
            if (window.DebugHelper) {
                window.DebugHelper.log(`Ham Excel verisi işleniyor: ${jsonData.length - 1} satır`, 'info');
                window.DebugHelper.log(`Kolon eşleştirme: ${Object.keys(this.columnMapping).length} kolon eşleşti`, 'info');
            }
            
            // Dosya boyutuna göre işleme yöntemi seç
            const rowCount = jsonData.length - 1;
            const isLargeFile = rowCount > 2000;
            
            console.log(`📊 Excel dosya boyutu: ${rowCount} satır ${isLargeFile ? '(BÜYÜK DOSYA)' : '(NORMAL)'}`);
            
            const processedData = isLargeFile ? 
                await this.processRawDataBatch(jsonData.slice(1), headers) :
                this.processRawData(jsonData.slice(1), headers);
            
            console.log(`📊 ${processedData.length} kayıt başarıyla okundu`);
            console.log('📊 İşlenmiş veri örneği:', processedData.slice(0, 2));
            
            // Debug helper'a da logla
            if (window.DebugHelper) {
                window.DebugHelper.log(`${processedData.length} kayıt başarıyla okundu`, 'success');
                if (processedData.length > 0) {
                    window.DebugHelper.log(`İlk kayıt örneği: ${JSON.stringify(processedData[0])}`, 'info');
                }
            }
            
            if (processedData.length === 0) {
                throw new Error('Excel dosyasından hiç geçerli kayıt okunamadı. Kolon başlıklarını ve veri formatını kontrol edin.');
            }
            
            return processedData;
            
        } catch (error) {
            console.error('Excel okuma hatası:', error);
            
            // Debug helper'a da logla
            if (window.DebugHelper) {
                window.DebugHelper.log(`❌ Excel okuma hatası: ${error.message}`, 'error');
                window.DebugHelper.log(`Hata detayı: ${error.stack}`, 'error');
            }
            
            throw new Error(`Excel dosyası okunamadı: ${error.message}`);
        }
    }

    // Dosyayı ArrayBuffer olarak oku
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                resolve(new Uint8Array(e.target.result));
            };
            
            reader.onerror = function(e) {
                reject(new Error('Dosya okuma hatası'));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }

    // Dosyayı text olarak oku
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            
            reader.onerror = function(e) {
                reject(new Error('Dosya okuma hatası'));
            };
            
            reader.readAsText(file, 'UTF-8');
        });
    }

    // CSV parse fonksiyonu
    parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim());
        const result = [];
        
        for (let line of lines) {
            // Basit CSV parsing - virgül ile ayır
            const row = line.split(',').map(cell => cell.trim());
            result.push(row);
        }
        
        console.log('CSV parse edildi:', result.length, 'satır');
        return result;
    }

    // Kolonları eşleştir
    mapColumns(headers) {
        this.columnMapping = {};
        
        console.log('📊 Excel başlıkları:', headers);
        if (window.DebugHelper) {
            window.DebugHelper.log(`Excel başlıkları: ${headers.join(', ')}`, 'info');
            window.DebugHelper.log(`Toplam ${headers.length} kolon bulundu`, 'info');
        }
        
        headers.forEach((header, index) => {
            if (!header) return;
            
            const originalHeader = header.toString().trim();
            const cleanHeader = Utils.cleanColumnName(header);
            console.log(`📊 Başlık ${index}: "${originalHeader}" -> temizlenmiş: "${cleanHeader}"`);
            
            // Her beklenen kolon için eşleşme ara
            for (const [key, variations] of Object.entries(this.expectedColumns)) {
                if (this.columnMapping[key] !== undefined) continue; // Zaten eşleşmiş
                
                let matched = false;
                let matchType = '';
                
                for (const variation of variations) {
                    const cleanVariation = Utils.cleanColumnName(variation);
                    
                    // 1. Tam eşleşme (en yüksek öncelik)
                    if (cleanHeader === cleanVariation) {
                        this.columnMapping[key] = index;
                        matchType = 'Tam eşleşme';
                        matched = true;
                        break;
                    }
                    
                    // 2. Başlangıç eşleşmesi
                    if (cleanHeader.startsWith(cleanVariation) || cleanVariation.startsWith(cleanHeader)) {
                        this.columnMapping[key] = index;
                        matchType = 'Başlangıç eşleşmesi';
                        matched = true;
                        break;
                    }
                    
                    // 3. İçerik eşleşmesi
                    if (cleanHeader.includes(cleanVariation) || cleanVariation.includes(cleanHeader)) {
                        this.columnMapping[key] = index;
                        matchType = 'İçerik eşleşmesi';
                        matched = true;
                        break;
                    }
                    
                    // 4. Benzerlik kontrolü (daha düşük eşik)
                    const similarity = this.calculateSimilarity(cleanHeader, cleanVariation);
                    if (similarity > 0.7) {
                        this.columnMapping[key] = index;
                        matchType = `Benzerlik eşleşmesi (${Math.round(similarity * 100)}%)`;
                        matched = true;
                        break;
                    }
                }
                
                if (matched) {
                    console.log(`✅ ${matchType}: "${originalHeader}" -> ${key}`);
                    if (window.DebugHelper) {
                        window.DebugHelper.log(`✅ ${matchType}: "${originalHeader}" -> ${key}`, 'success');
                    }
                    break;
                }
            }
        });
        
        console.log('📊 Kolon eşleştirme sonucu:', this.columnMapping);
        
        // Eşleşmeyen başlıkları göster
        const unmatchedHeaders = headers.filter((header, index) => {
            return header && !Object.values(this.columnMapping).includes(index);
        });
        
        if (unmatchedHeaders.length > 0) {
            console.log('⚠️ Eşleşmeyen başlıklar:', unmatchedHeaders);
        }
        
        // Kritik kolonları kontrol et
        this.validateRequiredColumns();
    }

    // String benzerlik hesaplama (basit Levenshtein distance)
    calculateSimilarity(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        
        if (len1 === 0) return len2 === 0 ? 1 : 0;
        if (len2 === 0) return 0;
        
        const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
        
        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;
        
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        
        const maxLen = Math.max(len1, len2);
        return (maxLen - matrix[len1][len2]) / maxLen;
    }

    // Gerekli kolonları doğrula
    validateRequiredColumns() {
        const requiredColumns = ['personel', 'islemTarihi', 'islemSaati'];
        const missingColumns = [];
        
        requiredColumns.forEach(col => {
            if (this.columnMapping[col] === undefined) {
                missingColumns.push(col);
            }
        });
        
        if (missingColumns.length > 0) {
            console.log('❌ Eksik kolonlar tespit edildi:', missingColumns);
            
            if (window.DebugHelper) {
                window.DebugHelper.log(`❌ Eksik kolonlar: ${missingColumns.join(', ')}`, 'error');
            }
            
            // Kullanıcı dostu hata mesajı oluştur
            let errorMessage = '❌ Gerekli kolonlar Excel dosyasında bulunamadı:\n\n';
            
            missingColumns.forEach(col => {
                const expectedFormats = this.expectedColumns[col];
                errorMessage += `🔍 "${this.getColumnDisplayName(col)}" kolonu için beklenen formatlar:\n`;
                errorMessage += `   • ${expectedFormats.slice(0, 5).join('\n   • ')}\n`;
                
                // En yakın eşleşmeleri öner
                const suggestions = this.findClosestMatches(col, Object.keys(this.rawHeaders || {}));
                if (suggestions.length > 0) {
                    errorMessage += `   💡 Öneriler: ${suggestions.slice(0, 3).join(', ')}\n`;
                }
                errorMessage += '\n';
            });
            
            errorMessage += '📋 Excel dosyanızdaki başlıklar:\n';
            errorMessage += Object.keys(this.rawHeaders || {}).map((h, i) => `   ${i + 1}. "${h}"`).join('\n');
            errorMessage += '\n\n';
            
            errorMessage += '💡 Çözüm önerileri:\n';
            errorMessage += '1. Kolon başlıklarınızı yukarıdaki formatlardan biriyle değiştirin\n';
            errorMessage += '2. İlk satırın başlık satırı olduğundan emin olun\n';
            errorMessage += '3. Boş kolonları kaldırın\n';
            errorMessage += '4. Türkçe karakterler kullanabilirsiniz';
            
            throw new Error(errorMessage);
        }
    }

    // Kolon görünen adını al
    getColumnDisplayName(columnKey) {
        const displayNames = {
            'personel': 'PERSONEL',
            'islemTarihi': 'İŞLEM TARİHİ',
            'islemSaati': 'İŞLEM SAATİ'
        };
        return displayNames[columnKey] || columnKey.toUpperCase();
    }

    // Ham veriyi işle
    processRawData(rows, headers) {
        const processedData = [];
        
        rows.forEach((row, rowIndex) => {
            try {
                // Boş satırları atla
                if (this.isEmptyRow(row)) return;
                
                const record = this.createRecord(row);
                
                // Veri doğrulaması
                if (this.validateRecord(record)) {
                    processedData.push(record);
                } else {
                    console.warn(`Satır ${rowIndex + 2} geçersiz veri içeriyor, atlandı`);
                }
                
            } catch (error) {
                console.warn(`Satır ${rowIndex + 2} işlenirken hata:`, error.message);
            }
        });
        
        return processedData;
    }

    // Büyük dosyalar için batch processing
    async processRawDataBatch(rows, headers) {
        const processedData = [];
        const batchSize = 500; // Stack overflow önlemek için küçültüldü
        const totalRows = rows.length;
        
        console.log(`📊 Batch processing başlatılıyor: ${totalRows} satır, ${Math.ceil(totalRows / batchSize)} batch`);
        
        if (window.DebugHelper) {
            window.DebugHelper.log(`Batch processing: ${totalRows} satır, ${Math.ceil(totalRows / batchSize)} batch`, 'info');
        }
        
        for (let i = 0; i < totalRows; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            const batchNumber = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(totalRows / batchSize);
            
            console.log(`📊 Batch ${batchNumber}/${totalBatches} işleniyor...`);
            
            // Progress göster
            if (Utils && Utils.showLoading) {
                Utils.showLoading(`Excel işleniyor... (${batchNumber}/${totalBatches})`);
            }
            
            // Batch'i işle
            const batchResults = this.processBatch(batch, i, headers);
            processedData.push(...batchResults);
            
            // UI'nin donmaması için kısa bir bekleme
            if (batchNumber < totalBatches) {
                await this.sleep(25); // Stack overflow önlemek için artırıldı
            }
        }
        
        console.log(`📊 Batch processing tamamlandı: ${processedData.length} kayıt`);
        
        // Memory temizliği
        if (typeof gc !== 'undefined') {
            gc(); // Node.js ortamında garbage collection
        }
        
        return processedData;
    }

    // Tek batch'i işle
    processBatch(batch, startIndex, headers) {
        const batchResults = [];
        
        batch.forEach((row, batchRowIndex) => {
            const rowIndex = startIndex + batchRowIndex;
            
            try {
                // Boş satırları atla
                if (this.isEmptyRow(row)) return;
                
                const record = this.createRecord(row);
                
                // Veri doğrulaması (batch'te daha az verbose)
                if (this.validateRecordQuick(record)) {
                    batchResults.push(record);
                }
                
            } catch (error) {
                // Batch processing'de hataları daha az verbose logla
                if (rowIndex < 10) { // İlk 10 hatayı logla
                    console.warn(`Satır ${rowIndex + 2} işlenirken hata:`, error.message);
                }
            }
        });
        
        return batchResults;
    }

    // Hızlı validasyon (batch processing için)
    validateRecordQuick(record) {
        return record.personel && 
               record.personel.length >= 2 && 
               record.islemTarihi && 
               record.islemSaati;
    }

    // Sleep fonksiyonu (UI donmaması için)
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Satırdan kayıt oluştur
    createRecord(row) {
        const record = {};
        
        // Her eşleşen kolon için veriyi al
        for (const [key, columnIndex] of Object.entries(this.columnMapping)) {
            let value = row[columnIndex];
            
            // Personel alanı için özel debug
            if (key === 'personel') {
                console.log(`📊 Personel verisi: kolon ${columnIndex}, değer: "${value}", tip: ${typeof value}`);
            }
            
            // Veri tipine göre işle
            switch (key) {
                case 'islemTarihi':
                case 'belgeTarihi':
                case 'uretimTarihi':
                    record[key] = this.parseDate(value);
                    break;
                    
                case 'islemSaati':
                case 'islemSaatiAnaliz':
                    record[key] = this.parseTime(value);
                    break;
                    
                case 'miktar':
                    record[key] = this.parseNumber(value);
                    break;
                    
                case 'personel':
                case 'hareketTipi':
                case 'genelHareketTipi':
                case 'proje':
                    record[key] = this.parseString(value);
                    break;
                    
                default:
                    record[key] = value ? value.toString().trim() : '';
            }
        }
        
        // Ek hesaplanan alanlar
        record.hareketTipiKategori = Utils.categorizeMovementType(record.hareketTipi);
        record.processedAt = new Date();
        
        return record;
    }

    // Tarih parsing
    parseDate(value) {
        if (!value) return null;
        
        try {
            // Excel serial date kontrolü
            if (typeof value === 'number' && value > 25000) {
                // Excel serial date to JS Date
                const excelEpoch = new Date(1900, 0, 1);
                const jsDate = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
                return jsDate;
            }
            
            // String tarih formatları
            if (typeof value === 'string') {
                // Türkçe tarih formatları: dd.mm.yyyy, dd/mm/yyyy
                const turkishDateRegex = /^(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{4})$/;
                const match = value.match(turkishDateRegex);
                
                if (match) {
                    const [, day, month, year] = match;
                    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                }
                
                // ISO format dene
                const isoDate = new Date(value);
                if (!isNaN(isoDate.getTime())) {
                    return isoDate;
                }
            }
            
            return null;
        } catch (error) {
            console.warn('Tarih parsing hatası:', value, error);
            return null;
        }
    }

    // Saat parsing
    parseTime(value) {
        if (!value) return null;
        
        try {
            // Excel time serial number
            if (typeof value === 'number' && value < 1) {
                const hours = Math.floor(value * 24);
                const minutes = Math.floor((value * 24 * 60) % 60);
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
            
            // String saat formatı
            if (typeof value === 'string') {
                // HH:MM formatını kontrol et
                const timeRegex = /^(\d{1,2}):(\d{2})$/;
                const match = value.match(timeRegex);
                
                if (match) {
                    const [, hours, minutes] = match;
                    return `${hours.padStart(2, '0')}:${minutes}`;
                }
                
                // Sadece saat varsa
                if (/^\d{1,2}$/.test(value)) {
                    return `${value.padStart(2, '0')}:00`;
                }
            }
            
            return value ? value.toString() : null;
        } catch (error) {
            console.warn('Saat parsing hatası:', value, error);
            return null;
        }
    }

    // Sayı parsing
    parseNumber(value) {
        if (!value) return 0;
        
        try {
            // String ise temizle
            if (typeof value === 'string') {
                // Türkçe sayı formatını temizle (1.234,56 -> 1234.56)
                const cleaned = value
                    .replace(/\./g, '') // Binlik ayırıcıları kaldır
                    .replace(',', '.'); // Ondalık ayırıcıyı değiştir
                
                const num = parseFloat(cleaned);
                return isNaN(num) ? 0 : num;
            }
            
            return typeof value === 'number' ? value : 0;
        } catch (error) {
            console.warn('Sayı parsing hatası:', value, error);
            return 0;
        }
    }

    // String parsing
    parseString(value) {
        if (!value) {
            console.log(`📊 parseString: Boş değer alındı:`, value);
            return '';
        }
        const result = value.toString().trim();
        console.log(`📊 parseString: "${value}" -> "${result}"`);
        return result;
    }

    // Boş satır kontrolü
    isEmptyRow(row) {
        return !row || row.every(cell => !cell || cell.toString().trim() === '');
    }

    // Kayıt doğrulaması
    validateRecord(record) {
        // Personel adı zorunlu
        if (!record.personel || record.personel.length < 2) {
            console.log(`❌ Geçersiz personel: "${record.personel}" (uzunluk: ${record.personel ? record.personel.length : 'undefined'})`);
            if (window.DebugHelper) {
                window.DebugHelper.log(`❌ Geçersiz personel: "${record.personel}"`, 'error');
            }
            return false;
        }
        
        // İşlem tarihi zorunlu
        if (!record.islemTarihi) {
            console.log(`❌ Geçersiz işlem tarihi: "${record.islemTarihi}"`);
            if (window.DebugHelper) {
                window.DebugHelper.log(`❌ Geçersiz işlem tarihi: "${record.islemTarihi}"`, 'error');
            }
            return false;
        }
        
        // İşlem saati zorunlu
        if (!record.islemSaati) {
            console.log(`❌ Geçersiz işlem saati: "${record.islemSaati}"`);
            if (window.DebugHelper) {
                window.DebugHelper.log(`❌ Geçersiz işlem saati: "${record.islemSaati}"`, 'error');
            }
            return false;
        }
        
        console.log(`✅ Geçerli kayıt: Personel="${record.personel}", Tarih="${record.islemTarihi}", Saat="${record.islemSaati}"`);
        if (window.DebugHelper) {
            window.DebugHelper.log(`✅ Geçerli kayıt: ${record.personel}`, 'success');
        }
        return true;
    }

    // Kolon eşleştirme raporu
    getColumnMappingReport() {
        const report = {
            mapped: {},
            unmapped: [],
            required: ['personel', 'islemTarihi', 'islemSaati'],
            optional: Object.keys(this.expectedColumns).filter(col => 
                !['personel', 'islemTarihi', 'islemSaati'].includes(col)
            ),
            suggestions: {}
        };
        
        // Eşleşen kolonlar
        for (const [key, index] of Object.entries(this.columnMapping)) {
            report.mapped[key] = index;
        }
        
        // Eşleşmeyen kolonlar
        report.unmapped = Object.keys(this.expectedColumns).filter(col => 
            this.columnMapping[col] === undefined
        );
        
        return report;
    }

    // Debug: Excel başlıklarını ve eşleştirme önerilerini göster
    debugColumnMapping(headers) {
        console.log('\n=== KOLON EŞLEŞTİRME DEBUG ===');
        console.log('Excel dosyasındaki başlıklar:');
        headers.forEach((header, index) => {
            console.log(`  ${index}: "${header}"`);
        });
        
        console.log('\nBeklenen kolon formatları:');
        Object.entries(this.expectedColumns).forEach(([key, variations]) => {
            console.log(`  ${key}: [${variations.join(', ')}]`);
        });
        
        console.log('\nEşleştirme sonuçları:');
        Object.entries(this.columnMapping).forEach(([key, index]) => {
            console.log(`  ✅ ${key} -> "${headers[index]}" (kolon ${index})`);
        });
        
        // Eşleşmeyen zorunlu kolonlar
        const requiredColumns = ['personel', 'islemTarihi', 'islemSaati'];
        const missingRequired = requiredColumns.filter(col => !this.columnMapping[col]);
        
        if (missingRequired.length > 0) {
            console.log('\n❌ Bulunamayan zorunlu kolonlar:');
            missingRequired.forEach(col => {
                console.log(`  - ${col}: Beklenen formatlar: [${this.expectedColumns[col].join(', ')}]`);
                
                // En yakın eşleşmeleri öner
                const suggestions = this.findClosestMatches(col, headers);
                if (suggestions.length > 0) {
                    console.log(`    Öneriler: ${suggestions.join(', ')}`);
                }
            });
        }
        
        console.log('=== DEBUG BİTTİ ===\n');
    }

    // En yakın eşleşmeleri bul
    findClosestMatches(targetColumn, headers, threshold = 0.4) {
        const variations = this.expectedColumns[targetColumn] || [];
        const suggestions = [];
        
        headers.forEach(header => {
            if (!header) return;
            
            const cleanHeader = Utils.cleanColumnName(header);
            let bestSimilarity = 0;
            
            variations.forEach(variation => {
                const cleanVariation = Utils.cleanColumnName(variation);
                const similarity = this.calculateSimilarity(cleanHeader, cleanVariation);
                
                if (similarity > threshold && similarity > bestSimilarity) {
                    bestSimilarity = similarity;
                }
            });
            
            if (bestSimilarity > threshold) {
                suggestions.push(`"${header}" (${Math.round(bestSimilarity * 100)}% benzer)`);
            }
        });
        
        return [...new Set(suggestions)].sort((a, b) => {
            const aPercent = parseInt(a.match(/(\d+)% benzer/)?.[1] || '0');
            const bPercent = parseInt(b.match(/(\d+)% benzer/)?.[1] || '0');
            return bPercent - aPercent;
        }); // Benzerlik oranına göre sırala
    }

    // Veri özeti
    getDataSummary(data) {
        if (!data || data.length === 0) return null;
        
        const summary = {
            totalRecords: data.length,
            dateRange: {
                start: null,
                end: null
            },
            personnel: new Set(),
            warehouses: new Set(),
            movementTypes: new Set(),
            projects: new Set()
        };
        
        data.forEach(record => {
            // Tarih aralığı
            if (record.islemTarihi) {
                const date = new Date(record.islemTarihi);
                if (!summary.dateRange.start || date < summary.dateRange.start) {
                    summary.dateRange.start = date;
                }
                if (!summary.dateRange.end || date > summary.dateRange.end) {
                    summary.dateRange.end = date;
                }
            }
            
            // Unique değerler
            if (record.personel) summary.personnel.add(record.personel);
            if (record.proje) summary.warehouses.add(record.proje);
            if (record.hareketTipiKategori) summary.movementTypes.add(record.hareketTipiKategori);
            if (record.proje) summary.projects.add(record.proje);
        });
        
        // Set'leri array'e çevir
        summary.personnel = Array.from(summary.personnel);
        summary.warehouses = Array.from(summary.warehouses);
        summary.movementTypes = Array.from(summary.movementTypes);
        summary.projects = Array.from(summary.projects);
        
        return summary;
    }
}

// Global olarak erişilebilir yap
window.ExcelParser = new ExcelParser();