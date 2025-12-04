# 📁 Yerel Klasördeki Excel Dosyalarını Kullanma

## 🎯 Sorun

Tarayıcı güvenlik kısıtlamaları yüzünden yerel dosya sistemine direkt erişemiyoruz.

## ✅ Çözümler

---

## Çözüm 1: Yerel Web Sunucusu (Önerilen)

### Adım 1: Excel Klasörü Oluştur

```
karinca-dashboard/
├── index.html
├── data/              ← YENİ KLASÖR
│   ├── gunluk.xlsx
│   ├── haftalik.xlsx
│   └── aylik.xlsx
└── ...
```

### Adım 2: Sunucuyu Başlat

**Yöntem A: Python ile (Kolay)**

1. `start_local_server.bat` dosyasına çift tıkla
2. Sunucu başlayacak: `http://localhost:8000`

**Yöntem B: Manuel Python**

```cmd
cd "C:\Users\huseyin.kilic\OneDrive - karincalogistics.com\Masaüstü\kiro deneme"
python -m http.server 8000
```

**Yöntem C: Node.js ile**

```cmd
npx http-server -p 8000
```

### Adım 3: Dashboard'da URL Kullan

```
http://localhost:8000/data/gunluk.xlsx
```

✅ Artık yerel dosyaları çekebilirsin!

---

## Çözüm 2: OneDrive Klasörü (Otomatik Senkronizasyon)

### Adım 1: Excel'leri OneDrive'a Koy

Zaten OneDrive kullanıyorsun:
```
C:\Users\huseyin.kilic\OneDrive - karincalogistics.com\Excel\
```

### Adım 2: OneDrive'da Paylaş

1. OneDrive web'e git
2. Excel klasörüne sağ tıkla → "Share"
3. "Anyone with the link" seç
4. Linki kopyala

### Adım 3: Dashboard'da Kullan

```
https://onedrive.live.com/download.aspx?cid=XXX&resid=YYY
```

✅ Excel'i her kaydettiğinde OneDrive otomatik senkronize eder!

---

## Çözüm 3: Otomatik GitHub Yükleme (Gelişmiş)

### Adım 1: Git Otomasyonu

Bir script oluştur:

**upload_to_github.bat:**
```batch
@echo off
echo Excel dosyalari GitHub'a yukleniyor...

cd "C:\Users\huseyin.kilic\OneDrive - karincalogistics.com\Masaüstü\kiro deneme"

copy "C:\Excel\gunluk.xlsx" data.xlsx

git add data.xlsx
git commit -m "Excel guncellendi: %date% %time%"
git push origin main

echo Tamamlandi!
pause
```

### Adım 2: Zamanlanmış Görev

Windows Task Scheduler ile her saat çalıştır.

---

## 🚀 Hızlı Başlangıç (Önerilen)

### 1️⃣ Yerel Sunucu Başlat

```cmd
start_local_server.bat
```

### 2️⃣ data/ Klasörü Oluştur

```
mkdir data
copy "C:\Excel\gunluk.xlsx" data\
```

### 3️⃣ Dashboard'da URL Kullan

```
http://localhost:8000/data/gunluk.xlsx
```

### 4️⃣ Otomatik Yenileme Aktif Et

- Otomatik yenileme: ✅
- Yenileme sıklığı: 30 dakika

✅ Her 30 dakikada güncel veriyi çeker!

---

## 💡 Hangi Çözümü Seçmeliyim?

| Çözüm | Avantaj | Dezavantaj | Önerilen |
|-------|---------|------------|----------|
| **Yerel Sunucu** | Hızlı, kolay | Sunucu açık olmalı | ⭐⭐⭐⭐⭐ |
| **OneDrive** | Otomatik senkronizasyon | Biraz yavaş | ⭐⭐⭐⭐ |
| **GitHub Otomatik** | Versiyon kontrolü | Karmaşık kurulum | ⭐⭐⭐ |

---

## 🔧 Detaylı Kurulum

### Yerel Sunucu Kurulumu

**1. Python Kontrolü:**
```cmd
python --version
```

Eğer yüklü değilse: https://www.python.org/downloads/

**2. Sunucu Başlat:**
```cmd
cd "C:\Users\huseyin.kilic\OneDrive - karincalogistics.com\Masaüstü\kiro deneme"
python -m http.server 8000
```

**3. Tarayıcıda Aç:**
```
http://localhost:8000
```

**4. Excel URL'i:**
```
http://localhost:8000/data/gunluk.xlsx
```

---

## 📊 Klasör Yapısı

```
kiro deneme/
├── index.html
├── js/
├── styles.css
├── data/                    ← YENİ KLASÖR
│   ├── gunluk.xlsx         ← Günlük Excel
│   ├── haftalik.xlsx       ← Haftalık Excel
│   └── aylik.xlsx          ← Aylık Excel
├── start_local_server.bat  ← Sunucu başlatıcı
└── README.md
```

---

## 🎯 Kullanım Senaryosu

### Senaryo: Günlük Excel Güncelleme

**1. Sabah:**
```
- Excel'i güncelle: C:\Excel\gunluk.xlsx
- data/ klasörüne kopyala
```

**2. Dashboard:**
```
- Otomatik yenileme aktif
- Her 30 dakikada çeker
- Güncel veriyi gösterir
```

**3. Akşam:**
```
- Excel'i tekrar güncelle
- Otomatik çekilir
```

---

## ⚠️ Dikkat Edilmesi Gerekenler

### Güvenlik

- ❌ Yerel sunucu sadece bilgisayarında çalışır
- ✅ Dışarıdan erişilemez
- ✅ Güvenli

### Performans

- ✅ Yerel sunucu çok hızlı
- ✅ İnternet gerektirmez
- ✅ Büyük dosyalar sorun değil

### Sınırlamalar

- ⚠️ Sunucu açık olmalı
- ⚠️ Bilgisayar açık olmalı
- ⚠️ Port 8000 boş olmalı

---

## 🧪 Test Etme

### 1. Sunucu Testi

```cmd
start_local_server.bat
```

Tarayıcıda aç:
```
http://localhost:8000
```

### 2. Excel Testi

data/ klasörüne test.xlsx koy:
```
http://localhost:8000/data/test.xlsx
```

### 3. Dashboard Testi

Dashboard'da URL'i yapıştır ve "Şimdi Çek"

---

## 🚨 Sorun Giderme

### "Python bulunamadı" Hatası

**Çözüm:**
1. Python'u yükle: https://www.python.org/downloads/
2. Kurulumda "Add to PATH" seç
3. Bilgisayarı yeniden başlat

### "Port 8000 kullanımda" Hatası

**Çözüm:**
Farklı port kullan:
```cmd
python -m http.server 8001
```

Dashboard'da:
```
http://localhost:8001/data/gunluk.xlsx
```

### "Dosya bulunamadı" Hatası

**Çözüm:**
1. data/ klasörü var mı kontrol et
2. Excel dosyası data/ içinde mi kontrol et
3. Dosya adı doğru mu kontrol et

---

## 📞 Hızlı Yardım

**Adım 1:** `start_local_server.bat` çalıştır
**Adım 2:** Excel'i `data/` klasörüne kopyala
**Adım 3:** Dashboard'da `http://localhost:8000/data/dosya.xlsx` kullan

**Bitti!** 🎉
