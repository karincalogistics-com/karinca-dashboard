# 🚀 Netlify Deployment Rehberi

## 📋 Gerekli Dosyalar

Dashboard'u deploy etmek için şu dosyalar gerekli:

### Ana Dosyalar
- ✅ `index.html` - Ana sayfa
- ✅ `styles.css` - Stil dosyası
- ✅ `karinca-logo.svg` - Logo
- ✅ `netlify.toml` - Netlify konfigürasyonu

### JavaScript Dosyaları
- ✅ `js/main.js`
- ✅ `js/utils.js`
- ✅ `js/dataProcessor.js`
- ✅ `js/excelParser.js`
- ✅ `js/chartManager.js`
- ✅ `js/debugHelper.js`
- ✅ `js/firebaseAuth.js` - **YENİ: Merkezi yetkilendirme**

### Konfigürasyon
- ✅ `README.md`
- ✅ `.gitignore`

---

## 🌐 Netlify'a Deploy Etme (3 Yöntem)

### **Yöntem 1: Drag & Drop (EN KOLAY)** ⭐

1. **Netlify'a Git**
   - https://app.netlify.com adresine gidin
   - "Sign up" ile ücretsiz hesap oluşturun (GitHub, Google veya Email ile)

2. **Deploy Et**
   - Ana sayfada "Add new site" → "Deploy manually" tıklayın
   - Tüm proje klasörünü sürükle-bırak yapın
   - Otomatik deploy başlar!

3. **Sonuç**
   - 1-2 dakika içinde hazır
   - Size otomatik URL verilir: `https://random-name-123.netlify.app`

---

### **Yöntem 2: Netlify CLI (Terminal)**

```bash
# 1. Netlify CLI'yi yükle
npm install -g netlify-cli

# 2. Giriş yap
netlify login

# 3. Deploy et
netlify deploy --prod

# Klasör seçimi: . (mevcut klasör)
```

---

### **Yöntem 3: GitHub ile Otomatik Deploy**

1. GitHub'a repository oluştur
2. Dosyaları push et
3. Netlify'da "Import from Git" seç
4. Her commit'te otomatik deploy olur

---

## 🎯 Deploy Sonrası

### **🔥 Firebase Kurulumu (ÖNEMLİ!)**
Deploy ettikten sonra Firebase'i yapılandırmanız gerekiyor:

1. **Hızlı Başlangıç:** `FIREBASE_QUICKSTART.md` dosyasını okuyun (5 dakika)
2. **Detaylı Rehber:** `FIREBASE_SETUP.md` dosyasına bakın

Firebase olmadan yetkilendirme sistemi çalışmaz!

### **Özel Domain Bağlama**
1. Netlify Dashboard → Domain settings
2. "Add custom domain" tıkla
3. DNS ayarlarını güncelle

### **HTTPS**
- Otomatik aktif (Let's Encrypt)
- Ücretsiz SSL sertifikası

### **Güncelleme**
- Aynı klasörü tekrar sürükle-bırak
- Veya GitHub'a push yap (otomatik deploy)

---

## 📊 Beklenen Sonuç

✅ URL: `https://karinca-dashboard.netlify.app`
✅ HTTPS: Otomatik aktif
✅ Hız: CDN ile hızlı yükleme
✅ Güvenlik: Güvenli bağlantı

---

## 🔧 Sorun Giderme

**Problem:** Dosyalar yüklenmiyor
**Çözüm:** Tüm js/ klasörünün dahil olduğundan emin olun

**Problem:** Logo görünmüyor
**Çözüm:** karinca-logo.svg dosyasının root'ta olduğunu kontrol edin

**Problem:** 404 hatası
**Çözüm:** netlify.toml dosyasının dahil olduğundan emin olun

---

## 📞 Destek

Sorun yaşarsanız:
- Netlify Docs: https://docs.netlify.com
- Netlify Support: https://answers.netlify.com

---

**Hazırlayan:** Kiro AI Assistant
**Tarih:** 2024
**Versiyon:** 1.0
