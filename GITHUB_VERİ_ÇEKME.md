# 📥 GitHub'dan Otomatik Veri Çekme Sistemi

## 🎯 Özellikler

✅ **GitHub'dan otomatik veri çekme**
✅ **Manuel dosya yükleme** (yedek seçenek)
✅ **Tarih seçici tablo** (istediğiniz günleri seçin)
✅ **Otomatik yenileme** (30 dk - 8 saat arası)
✅ **Gerçek zamanlı güncelleme**

---

## 📋 Kurulum Adımları

### 1️⃣ Excel Dosyanızı GitHub'a Yükleyin

1. GitHub hesabınıza giriş yapın
2. Yeni bir repository oluşturun (public veya private)
3. Excel dosyanızı repository'ye yükleyin
4. Dosyaya tıklayın ve **"Raw"** butonuna basın
5. Açılan sayfanın URL'ini kopyalayın

**Örnek Raw URL:**
```
https://raw.githubusercontent.com/kullanici-adi/repo-adi/main/shift_schedule.xlsx
```

### 2️⃣ Dashboard'da Ayarları Yapın

1. Dashboard'u açın
2. **"🔗 GitHub'dan Otomatik Veri Çekme"** kartını bulun
3. **"Ayarlar"** butonuna tıklayın
4. Kopyaladığınız Raw URL'i yapıştırın
5. İsterseniz **"Otomatik yenileme"** seçeneğini aktif edin
6. Yenileme sıklığını seçin (30 dk, 1 saat, 2 saat, vb.)
7. **"💾 Ayarları Kaydet"** butonuna tıklayın

### 3️⃣ Veriyi Çekin

**Manuel çekme:**
- **"📥 Şimdi Çek"** butonuna tıklayın

**Otomatik çekme:**
- Ayarlarda "Otomatik yenileme" aktifse, belirlediğiniz sürede otomatik çekilir

---

## 📅 Tarih Seçici Kullanımı

### Tüm Verileri Görüntüleme

1. Veri yüklendikten sonra **"📅 Tarih Seçici"** butonuna tıklayın
2. Tüm günler ve istatistikleri içeren tablo açılır

### Günleri Seçme

**Tek tek seçim:**
- Her satırdaki checkbox'ı işaretleyin

**Toplu seçim:**
- **"Tümünü Seç"** butonu: Tüm günleri seçer
- **"Temizle"** butonu: Tüm seçimleri kaldırır
- Üstteki checkbox: Tüm günleri seç/kaldır

### Dashboard'a Aktarma

1. İstediğiniz günleri seçin
2. **"Dashboard'a Aktar"** butonuna tıklayın
3. Dashboard sadece seçili günlerin verilerini gösterir

**Tablo Kolonları:**
- **Tarih:** İşlem tarihi ve gün adı
- **Personel:** O gün çalışan personel sayısı
- **İşlem:** Toplam işlem sayısı
- **Miktar:** Toplam miktar
- **Proje:** Aktif proje sayısı

---

## 🔄 Otomatik Yenileme Ayarları

### Yenileme Sıklıkları

- **30 dakika:** Çok sık güncellenen veriler için
- **1 saat:** Önerilen (varsayılan)
- **2 saat:** Normal kullanım
- **4 saat:** Günde birkaç kez güncelleme
- **8 saat:** Günlük güncelleme

### Otomatik Yenilemeyi Durdurma

1. GitHub ayarlarını açın
2. "Otomatik yenileme" checkbox'ını kaldırın
3. "Ayarları Kaydet" butonuna tıklayın

---

## 💡 İpuçları

### GitHub URL Formatı

✅ **Doğru:**
```
https://raw.githubusercontent.com/user/repo/main/data.xlsx
https://raw.githubusercontent.com/user/repo/master/shift_schedule.csv
```

❌ **Yanlış:**
```
https://github.com/user/repo/blob/main/data.xlsx  (blob içeriyor)
https://github.com/user/repo/data.xlsx  (raw değil)
```

### Dosya Formatları

Desteklenen formatlar:
- `.xlsx` (Excel 2007+)
- `.xls` (Eski Excel)
- `.csv` (Virgülle ayrılmış)

### Güvenlik

**Public Repository:**
- Herkes dosyayı görebilir
- Hassas veri içermemeli

**Private Repository:**
- Sadece siz görebilirsiniz
- GitHub token gerekebilir (gelişmiş)

---

## 🚀 Kullanım Senaryoları

### Senaryo 1: Günlük Otomatik Güncelleme

1. Excel dosyanızı her gün GitHub'a yükleyin
2. Otomatik yenileme: **1 saat**
3. Dashboard her saat güncel veriyi çeker

### Senaryo 2: Haftalık Analiz

1. Haftalık Excel dosyasını GitHub'a yükleyin
2. Tarih seçicide son 7 günü seçin
3. Haftalık performansı görüntüleyin

### Senaryo 3: Karşılaştırmalı Analiz

1. Tüm verileri yükleyin
2. Tarih seçicide farklı dönemleri seçin
3. Dönemler arası karşılaştırma yapın

---

## ❓ Sık Sorulan Sorular

### Dosya güncellenince otomatik çekilir mi?

Evet, otomatik yenileme aktifse belirlediğiniz sürede çekilir.

### Manuel dosya yükleme hala çalışıyor mu?

Evet, GitHub ayarı yapmadan da manuel dosya yükleyebilirsiniz.

### Birden fazla dosya çekebilir miyim?

Şu anda tek dosya destekleniyor. Tüm verileri tek Excel'de birleştirin.

### Private repository kullanabilir miyim?

Şu anda sadece public repository veya raw link destekleniyor.

### Veri ne kadar sürede çekilir?

Dosya boyutuna bağlı, genelde 2-5 saniye.

---

## 🛠️ Sorun Giderme

### "GitHub'dan veri çekilemedi" Hatası

**Çözümler:**
1. URL'in "raw.githubusercontent.com" içerdiğinden emin olun
2. Dosyanın public olduğunu kontrol edin
3. İnternet bağlantınızı kontrol edin
4. Dosya formatının doğru olduğunu kontrol edin

### "Dosya boş" Hatası

**Çözümler:**
1. Excel dosyasının içinde veri olduğundan emin olun
2. Dosyayı GitHub'a tekrar yükleyin
3. Raw URL'i yeniden kopyalayın

### Otomatik yenileme çalışmıyor

**Çözümler:**
1. Ayarlarda "Otomatik yenileme" aktif mi kontrol edin
2. Sayfayı yenileyin
3. Ayarları tekrar kaydedin

---

## 📞 Destek

Sorun yaşarsanız:
1. Tarayıcı konsolunu açın (F12)
2. Hata mesajlarını kontrol edin
3. GitHub URL'ini kontrol edin
4. Manuel dosya yüklemeyi deneyin

---

**🎉 Artık verileriniz otomatik olarak güncellenecek!**
