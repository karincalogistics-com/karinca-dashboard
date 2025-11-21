# 🔥 Firebase Kurulum Rehberi

Bu rehber, dashboard'unuzda merkezi yetkilendirme sistemi kurmak için Firebase'i nasıl yapılandıracağınızı gösterir.

## 📋 Adım 1: Firebase Projesi Oluşturun

1. **Firebase Console'a gidin:**
   - https://console.firebase.google.com adresine gidin
   - Google hesabınızla giriş yapın

2. **Yeni Proje Oluşturun:**
   - "Add project" (Proje ekle) butonuna tıklayın
   - Proje adı: `karinca-dashboard` (veya istediğiniz bir isim)
   - Google Analytics'i devre dışı bırakabilirsiniz (isteğe bağlı)
   - "Create project" butonuna tıklayın

## 📋 Adım 2: Realtime Database Oluşturun

1. **Sol menüden "Build" → "Realtime Database" seçin**

2. **"Create Database" butonuna tıklayın**

3. **Database konumunu seçin:**
   - Europe (eur3) - Avrupa için önerilen
   - Veya size en yakın konumu seçin

4. **Güvenlik kurallarını seçin:**
   - "Start in **test mode**" seçin (şimdilik)
   - "Enable" butonuna tıklayın

## 📋 Adım 3: Güvenlik Kurallarını Ayarlayın

1. **"Rules" sekmesine gidin**

2. **Aşağıdaki kuralları yapıştırın:**

```json
{
  "rules": {
    "authorizedEmails": {
      ".read": true,
      ".write": "auth != null"
    },
    "adminEmails": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

3. **"Publish" butonuna tıklayın**

> **Not:** Bu kurallar herkesin okuma yapmasına izin verir ama yazma için authentication gerektirir. Şimdilik test için yeterli.

## 📋 Adım 4: Web App Yapılandırması

1. **Proje ayarlarına gidin:**
   - Sol üstteki ⚙️ (dişli) ikonuna tıklayın
   - "Project settings" seçin

2. **"Your apps" bölümüne gidin**

3. **Web app ekleyin:**
   - `</>` (Web) ikonuna tıklayın
   - App nickname: `Dashboard Web App`
   - "Register app" butonuna tıklayın

4. **Firebase yapılandırma kodunu kopyalayın:**
   - Ekranda gösterilen `firebaseConfig` objesini kopyalayın
   - Şuna benzer görünecek:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "karinca-dashboard.firebaseapp.com",
  databaseURL: "https://karinca-dashboard-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "karinca-dashboard",
  storageBucket: "karinca-dashboard.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## 📋 Adım 5: Yapılandırmayı Projenize Ekleyin

1. **`js/firebaseAuth.js` dosyasını açın**

2. **Dosyanın başındaki `firebaseConfig` objesini bulun:**

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. **Firebase Console'dan kopyaladığınız değerlerle değiştirin**

4. **Dosyayı kaydedin**

## 📋 Adım 6: İlk Verileri Ekleyin

1. **Firebase Console'da "Realtime Database" sayfasına gidin**

2. **"Data" sekmesinde, `+` butonuna tıklayın**

3. **İlk veriyi ekleyin:**
   - Name: `authorizedEmails`
   - Value: `[]` (boş array)
   - "Add" butonuna tıklayın

4. **İkinci veriyi ekleyin:**
   - Name: `adminEmails`
   - Value: `[]` (boş array)
   - "Add" butonuna tıklayın

Şu şekilde görünmeli:

```
karinca-dashboard-default-rtdb
  ├── authorizedEmails: []
  └── adminEmails: []
```

## 📋 Adım 7: Test Edin

1. **Dosyaları Netlify'a yükleyin:**
   - Tüm dosyaları (güncellenmiş `index.html` ve yeni `js/firebaseAuth.js` dahil)
   - Netlify'a sürükle-bırak yapın

2. **Dashboard'a gidin ve giriş yapın:**
   - Ana anahtar kullanıcı email'i: `huseyin.kilic@karincalogistics.com`

3. **Anahtar Kullanıcı Paneli'ni açın:**
   - Sağ üstteki ⚙️ → "Anahtar Kullanıcı Paneli"

4. **Yeni kullanıcı ekleyin:**
   - Test için bir email adresi ekleyin
   - Firebase Console'da "Realtime Database" → "Data" sekmesinde
   - Email'in listeye eklendiğini göreceksiniz!

5. **Başka bir bilgisayardan test edin:**
   - Eklediğiniz email ile giriş yapın
   - Artık çalışmalı! 🎉

## 🔒 Güvenlik İyileştirmeleri (Opsiyonel)

Daha güvenli bir sistem için:

1. **Firebase Authentication ekleyin:**
   - "Build" → "Authentication" → "Get started"
   - "Email/Password" provider'ı aktif edin

2. **Güvenlik kurallarını güncelleyin:**

```json
{
  "rules": {
    "authorizedEmails": {
      ".read": true,
      ".write": "root.child('adminEmails').val().contains(auth.token.email)"
    },
    "adminEmails": {
      ".read": true,
      ".write": "root.child('adminEmails').val().contains(auth.token.email)"
    }
  }
}
```

## 🆘 Sorun Giderme

### Firebase başlatılamıyor
- **Çözüm:** `firebaseConfig` değerlerini kontrol edin
- Browser console'da hata mesajlarını kontrol edin

### Email eklenmiyor
- **Çözüm:** Firebase Console'da "Realtime Database" → "Rules" kontrol edin
- Test mode'da olduğundan emin olun

### Başka bilgisayardan giriş yapamıyor
- **Çözüm:** Firebase Console'da "Data" sekmesinde email'in eklendiğini kontrol edin
- Browser cache'i temizleyin ve tekrar deneyin

## 📞 Destek

Sorun yaşarsanız:
- Firebase Docs: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com

---

**Hazırlayan:** Kiro AI Assistant  
**Tarih:** 2024  
**Versiyon:** 1.0
