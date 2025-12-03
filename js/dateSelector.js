// Tarih seçici modülü - Tüm verileri göster, seçilen günleri dashboard'a aktar

const DateSelector = {
    allData: null,
    selectedDates: new Set(),
    dateGroups: {},

    // Tüm verileri yükle ve tarihlere göre grupla
    loadAllData(processedData) {
        this.allData = processedData;
        this.groupByDate();
        this.renderDateTable();
    },

    // Verileri tarihlere göre grupla
    groupByDate() {
        this.dateGroups = {};

        if (!this.allData || !this.allData.personnel) return;

        this.allData.personnel.forEach(person => {
            if (!person.transactions) return;

            person.transactions.forEach(transaction => {
                const date = transaction.date || 'Tarih Yok';
                
                if (!this.dateGroups[date]) {
                    this.dateGroups[date] = {
                        date: date,
                        personnel: new Set(),
                        transactions: 0,
                        quantity: 0,
                        warehouses: new Set()
                    };
                }

                this.dateGroups[date].personnel.add(person.name);
                this.dateGroups[date].transactions++;
                this.dateGroups[date].quantity += transaction.quantity || 0;
                if (transaction.warehouse) {
                    this.dateGroups[date].warehouses.add(transaction.warehouse);
                }
            });
        });

        console.log('📅 Tarih grupları oluşturuldu:', Object.keys(this.dateGroups).length, 'gün');
    },

    // Tarih tablosunu render et
    renderDateTable() {
        const container = document.getElementById('date-selector-container');
        if (!container) {
            console.error('❌ date-selector-container bulunamadı');
            return;
        }

        const dates = Object.keys(this.dateGroups).sort((a, b) => {
            // Tarihleri karşılaştır (DD.MM.YYYY formatı)
            const dateA = this.parseDate(a);
            const dateB = this.parseDate(b);
            return dateB - dateA; // Yeniden eskiye
        });

        let html = `
            <div class="date-selector-header">
                <h3>📅 Tarih Seçici</h3>
                <div class="date-selector-actions">
                    <button class="btn btn-sm" onclick="DateSelector.selectAll()">Tümünü Seç</button>
                    <button class="btn btn-sm" onclick="DateSelector.clearAll()">Temizle</button>
                    <button class="btn btn-primary btn-sm" onclick="DateSelector.applySelection()">
                        Dashboard'a Aktar
                    </button>
                </div>
            </div>
            <div class="date-table-wrapper">
                <table class="date-table">
                    <thead>
                        <tr>
                            <th width="50">
                                <input type="checkbox" id="select-all-dates" 
                                    onchange="DateSelector.toggleAll(this.checked)">
                            </th>
                            <th>Tarih</th>
                            <th>Personel</th>
                            <th>İşlem</th>
                            <th>Miktar</th>
                            <th>Proje</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        dates.forEach(date => {
            const group = this.dateGroups[date];
            const isSelected = this.selectedDates.has(date);

            html += `
                <tr class="date-row ${isSelected ? 'selected' : ''}" data-date="${date}">
                    <td>
                        <input type="checkbox" 
                            class="date-checkbox" 
                            value="${date}"
                            ${isSelected ? 'checked' : ''}
                            onchange="DateSelector.toggleDate('${date}', this.checked)">
                    </td>
                    <td class="date-cell">
                        <strong>${date}</strong>
                        <small>${this.getDayName(date)}</small>
                    </td>
                    <td>${group.personnel.size}</td>
                    <td>${group.transactions}</td>
                    <td>${group.quantity.toLocaleString()}</td>
                    <td>${group.warehouses.size}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
            <div class="date-selector-footer">
                <span class="selection-count">
                    ${this.selectedDates.size} gün seçildi
                </span>
            </div>
        `;

        container.innerHTML = html;
    },

    // Tarihi parse et (DD.MM.YYYY -> Date)
    parseDate(dateStr) {
        if (!dateStr || dateStr === 'Tarih Yok') return new Date(0);
        
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }
        return new Date(dateStr);
    },

    // Gün adını getir
    getDayName(dateStr) {
        const date = this.parseDate(dateStr);
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        return days[date.getDay()];
    },

    // Tek tarih seç/kaldır
    toggleDate(date, checked) {
        if (checked) {
            this.selectedDates.add(date);
        } else {
            this.selectedDates.delete(date);
        }

        this.updateSelectionCount();
        this.updateRowStyle(date, checked);
    },

    // Tüm tarihleri seç/kaldır
    toggleAll(checked) {
        const checkboxes = document.querySelectorAll('.date-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = checked;
            this.toggleDate(cb.value, checked);
        });
    },

    // Tümünü seç
    selectAll() {
        Object.keys(this.dateGroups).forEach(date => {
            this.selectedDates.add(date);
        });
        this.renderDateTable();
    },

    // Tümünü temizle
    clearAll() {
        this.selectedDates.clear();
        this.renderDateTable();
    },

    // Satır stilini güncelle
    updateRowStyle(date, selected) {
        const row = document.querySelector(`tr[data-date="${date}"]`);
        if (row) {
            if (selected) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
        }
    },

    // Seçim sayısını güncelle
    updateSelectionCount() {
        const countEl = document.querySelector('.selection-count');
        if (countEl) {
            countEl.textContent = `${this.selectedDates.size} gün seçildi`;
        }
    },

    // Seçimi dashboard'a uygula
    applySelection() {
        if (this.selectedDates.size === 0) {
            Utils.showNotification('Lütfen en az bir tarih seçin', 'warning');
            return;
        }

        console.log('📊 Seçilen tarihler dashboard\'a aktarılıyor:', Array.from(this.selectedDates));

        // Seçilen tarihlere göre veriyi filtrele
        const filteredData = this.filterDataByDates();

        // Dashboard'u güncelle
        if (window.AppState) {
            window.AppState.processedData = filteredData;
            window.updateDashboard();
            
            Utils.showNotification(
                `✅ ${this.selectedDates.size} günlük veri dashboard'a aktarıldı`, 
                'success'
            );
        }
    },

    // Seçilen tarihlere göre veriyi filtrele
    filterDataByDates() {
        if (!this.allData) return null;

        const selectedDatesArray = Array.from(this.selectedDates);
        
        // Personel verilerini filtrele
        const filteredPersonnel = this.allData.personnel.map(person => {
            const filteredTransactions = person.transactions.filter(t => 
                selectedDatesArray.includes(t.date)
            );

            // Filtrelenmiş işlemlere göre istatistikleri yeniden hesapla
            const totalQuantity = filteredTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0);
            const warehouses = new Set(filteredTransactions.map(t => t.warehouse).filter(Boolean));

            return {
                ...person,
                transactions: filteredTransactions,
                totalTransactions: filteredTransactions.length,
                totalQuantity: totalQuantity,
                warehouses: Array.from(warehouses),
                warehousesArray: Array.from(warehouses)
            };
        }).filter(person => person.totalTransactions > 0); // Boş personeli çıkar

        // Toplam istatistikleri hesapla
        const totalTransactions = filteredPersonnel.reduce((sum, p) => sum + p.totalTransactions, 0);
        const totalQuantity = filteredPersonnel.reduce((sum, p) => sum + p.totalQuantity, 0);
        const allWarehouses = new Set();
        filteredPersonnel.forEach(p => p.warehouses.forEach(w => allWarehouses.add(w)));

        return {
            ...this.allData,
            personnel: filteredPersonnel,
            totalTransactions: totalTransactions,
            totalQuantity: totalQuantity,
            warehouses: Array.from(allWarehouses)
        };
    }
};

// Global erişim
window.DateSelector = DateSelector;
