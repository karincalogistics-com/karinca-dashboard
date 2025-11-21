// Firebase Authentication ve Yetkilendirme Sistemi
// Karınca Dashboard - Merkezi Yetkilendirme

// ============================================
// FİREBASE YAPILANDIRMASI
// ============================================
// BURAYA KENDİ FİREBASE CONFİG'İNİZİ YAPIŞTIRIN!

const firebaseConfig = {
  apiKey: "AIzaSyDKUJbUcQ8mLJ8X1rclVs-oBN_rvCSPFAo",
  authDomain: "karinca-dashboard-bd8bd.firebaseapp.com",
  databaseURL: "https://karinca-dashboard-bd8bd-default-rtdb.firebaseio.com",
  projectId: "karinca-dashboard-bd8bd",
  storageBucket: "karinca-dashboard-bd8bd.firebasestorage.app",
  messagingSenderId: "874395854576",
  appId: "1:874395854576:web:ab7a92d38f73d7e1014435"
};

// ============================================
// GLOBAL DEĞİŞKENLER
// ============================================
const MASTER_ADMIN_EMAIL = 'huseyin.kilic@karincalogistics.com';
let firebaseApp = null;
let database = null;
let isFirebaseInitialized = false;

// ============================================
// FİREBASE BAŞLATMA
// ============================================
function initializeFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK yüklenmedi!');
            return false;
        }
        
        if (!firebaseApp) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            database = firebase.database();
            isFirebaseInitialized = true;
            console.log('✅ Firebase başarıyla başlatıldı');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Firebase başlatma hatası:', error);
        return false;
    }
}

// ============================================
// YETKİLİ EMAIL LİSTESİ (Firebase)
// ============================================
async function getAuthorizedEmailsFromFirebase() {
    try {
        if (!isFirebaseInitialized) {
            console.warn('⚠️ Firebase başlatılmamış, yerel cache kullanılıyor');
            return getLocalAuthorizedEmails();
        }
        
        const snapshot = await database.ref('authorizedEmails').once('value');
        const emails = snapshot.val() || [];
        
        // Yerel cache'e kaydet
        localStorage.setItem('dashboard-authorized-emails-cache', JSON.stringify(emails));
        
        return emails;
    } catch (error) {
        console.error('❌ Firebase\'den email listesi alınamadı:', error);
        return getLocalAuthorizedEmails();
    }
}

// ============================================
// ADMİN EMAIL LİSTESİ (Firebase)
// ============================================
async function getAdminEmailsFromFirebase() {
    try {
        if (!isFirebaseInitialized) {
            console.warn('⚠️ Firebase başlatılmamış, yerel cache kullanılıyor');
            return getLocalAdminEmails();
        }
        
        const snapshot = await database.ref('adminEmails').once('value');
        const emails = snapshot.val() || [];
        
        // Ana anahtar kullanıcıyı her zaman dahil et
        if (!emails.includes(MASTER_ADMIN_EMAIL)) {
            emails.unshift(MASTER_ADMIN_EMAIL);
        }
        
        // Yerel cache'e kaydet
        localStorage.setItem('dashboard-admin-emails-cache', JSON.stringify(emails));
        
        return emails;
    } catch (error) {
        console.error('❌ Firebase\'den admin listesi alınamadı:', error);
        return getLocalAdminEmails();
    }
}

// ============================================
// YETKİLİ EMAIL EKLE (Firebase)
// ============================================
async function addAuthorizedEmailToFirebase(email) {
    try {
        if (!isFirebaseInitialized) {
            console.error('❌ Firebase başlatılmamış');
            return false;
        }
        
        const emails = await getAuthorizedEmailsFromFirebase();
        
        if (!emails.includes(email)) {
            emails.push(email);
            await database.ref('authorizedEmails').set(emails);
            
            localStorage.setItem('dashboard-authorized-emails-cache', JSON.stringify(emails));
            console.log('✅ Email Firebase\'e eklendi:', email);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('❌ Firebase\'e email eklenemedi:', error);
        return false;
    }
}

// ============================================
// YETKİLİ EMAIL KALDIR (Firebase)
// ============================================
async function removeAuthorizedEmailFromFirebase(email) {
    try {
        if (!isFirebaseInitialized) {
            console.error('❌ Firebase başlatılmamış');
            return false;
        }
        
        const emails = await getAuthorizedEmailsFromFirebase();
        const filteredEmails = emails.filter(e => e !== email);
        
        await database.ref('authorizedEmails').set(filteredEmails);
        
        localStorage.setItem('dashboard-authorized-emails-cache', JSON.stringify(filteredEmails));
        console.log('✅ Email Firebase\'den kaldırıldı:', email);
        return true;
    } catch (error) {
        console.error('❌ Firebase\'den email kaldırılamadı:', error);
        return false;
    }
}

// ============================================
// ADMİN EMAIL EKLE (Firebase)
// ============================================
async function addAdminEmailToFirebase(email) {
    try {
        if (!isFirebaseInitialized) {
            console.error('❌ Firebase başlatılmamış');
            return false;
        }
        
        const emails = await getAdminEmailsFromFirebase();
        
        if (!emails.includes(email)) {
            emails.push(email);
            const filteredEmails = emails.filter(e => e !== MASTER_ADMIN_EMAIL);
            await database.ref('adminEmails').set(filteredEmails);
            
            // Normal kullanıcı listesinden kaldır
            await removeAuthorizedEmailFromFirebase(email);
            
            localStorage.setItem('dashboard-admin-emails-cache', JSON.stringify(emails));
            console.log('✅ Admin email Firebase\'e eklendi:', email);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('❌ Firebase\'e admin email eklenemedi:', error);
        return false;
    }
}

// ============================================
// ADMİN EMAIL KALDIR (Firebase)
// ============================================
async function removeAdminEmailFromFirebase(email) {
    try {
        if (!isFirebaseInitialized) {
            console.error('❌ Firebase başlatılmamış');
            return false;
        }
        
        if (email === MASTER_ADMIN_EMAIL) {
            console.warn('⚠️ Ana anahtar kullanıcı kaldırılamaz');
            return false;
        }
        
        const emails = await getAdminEmailsFromFirebase();
        const filteredEmails = emails.filter(e => e !== email && e !== MASTER_ADMIN_EMAIL);
        
        await database.ref('adminEmails').set(filteredEmails);
        
        localStorage.setItem('dashboard-admin-emails-cache', JSON.stringify(filteredEmails));
        console.log('✅ Admin email Firebase\'den kaldırıldı:', email);
        return true;
    } catch (error) {
        console.error('❌ Firebase\'den admin email kaldırılamadı:', error);
        return false;
    }
}

// ============================================
// YEREL CACHE (Fallback)
// ============================================
function getLocalAuthorizedEmails() {
    const cache = localStorage.getItem('dashboard-authorized-emails-cache');
    if (cache) {
        return JSON.parse(cache);
    }
    
    const oldEmails = localStorage.getItem('dashboard-authorized-emails');
    return oldEmails ? JSON.parse(oldEmails) : [];
}

function getLocalAdminEmails() {
    const cache = localStorage.getItem('dashboard-admin-emails-cache');
    if (cache) {
        const emails = JSON.parse(cache);
        if (!emails.includes(MASTER_ADMIN_EMAIL)) {
            emails.unshift(MASTER_ADMIN_EMAIL);
        }
        return emails;
    }
    
    const oldEmails = localStorage.getItem('dashboard-admin-emails');
    const emails = oldEmails ? JSON.parse(oldEmails) : [];
    if (!emails.includes(MASTER_ADMIN_EMAIL)) {
        emails.unshift(MASTER_ADMIN_EMAIL);
    }
    
    if (emails.length === 0) {
        return [MASTER_ADMIN_EMAIL];
    }
    
    return emails;
}

// ============================================
// KULLANICI YETKİ KONTROLÜ
// ============================================
async function checkUserAuthorization(email) {
    // Ana anahtar kullanıcı her zaman yetkilidir
    if (email === MASTER_ADMIN_EMAIL) {
        console.log('✅ Ana anahtar kullanıcı - Otomatik yetki verildi');
        return true;
    }
    
    try {
        const authorizedEmails = await getAuthorizedEmailsFromFirebase();
        const adminEmails = await getAdminEmailsFromFirebase();
        
        return adminEmails.includes(email) || authorizedEmails.includes(email);
    } catch (error) {
        console.error('❌ Yetki kontrolü hatası:', error);
        const localAuthorized = getLocalAuthorizedEmails();
        const localAdmins = getLocalAdminEmails();
        return localAdmins.includes(email) || localAuthorized.includes(email);
    }
}

// ============================================
// FİREBASE DEĞİŞİKLİKLERİNİ DİNLE
// ============================================
function setupFirebaseListeners() {
    if (!isFirebaseInitialized) return;
    
    // Yetkili email listesi değişikliklerini dinle
    database.ref('authorizedEmails').on('value', (snapshot) => {
        const emails = snapshot.val() || [];
        localStorage.setItem('dashboard-authorized-emails-cache', JSON.stringify(emails));
        console.log('📡 Yetkili email listesi güncellendi');
    });
    
    // Admin email listesi değişikliklerini dinle
    database.ref('adminEmails').on('value', (snapshot) => {
        const emails = snapshot.val() || [];
        if (!emails.includes(MASTER_ADMIN_EMAIL)) {
            emails.unshift(MASTER_ADMIN_EMAIL);
        }
        localStorage.setItem('dashboard-admin-emails-cache', JSON.stringify(emails));
        console.log('📡 Admin email listesi güncellendi');
    });
}

// ============================================
// EMAIL DOĞRULAMA
// ============================================
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ============================================
// EXPORT FONKSİYONLAR
// ============================================
window.FirebaseAuth = {
    initialize: initializeFirebase,
    getAuthorizedEmails: getAuthorizedEmailsFromFirebase,
    getAdminEmails: getAdminEmailsFromFirebase,
    addAuthorizedEmail: addAuthorizedEmailToFirebase,
    removeAuthorizedEmail: removeAuthorizedEmailFromFirebase,
    addAdminEmail: addAdminEmailToFirebase,
    removeAdminEmail: removeAdminEmailFromFirebase,
    checkUserAuthorization: checkUserAuthorization,
    setupListeners: setupFirebaseListeners,
    isValidEmail: isValidEmail
};
