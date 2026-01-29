# 🚀 Promptda VPS Deployment Rehberi (Sıfırdan)

Bu rehber, **Promptda** web uygulamanızı yeni bir VPS sunucusuna kurmak için **sıfırdan** gerekli tüm adımları içerir.

---

## 📋 Gereksinimler

**VPS Özellikleri:**
- **OS:** Ubuntu 22.04 LTS veya 24.04 LTS (Önerilen)
- **RAM:** Minimum 2GB (4GB önerilir)
- **Disk:** 20GB+
- **IP:** Public IP adresi

**Yerel Gereksinimler:**
- Git kurulu
- SSH client (Windows için PuTTY veya PowerShell)

---

## 🔧 Adım 1: VPS'e İlk Bağlantı

### 1.1 SSH ile Bağlanma

VPS sağlayıcınızdan aldığınız bilgilerle bağlanın:

```bash
ssh root@VPS_IP_ADRESINIZ
```

**Örnek:**
```bash
ssh root@185.123.45.67
```

İlk kez bağlanıyorsanız şifre soracaktır (VPS sağlayıcınızın verdiği root şifresi).

---

## 🔐 Adım 2: Güvenlik Ayarları

### 2.1 Root Şifresini Değiştirin

```bash
passwd
```

Güçlü bir şifre belirleyin (büyük/küçük harf, rakam, özel karakter).

### 2.2 Yeni Kullanıcı Oluşturun (Güvenlik İçin)

Root kullanıcısı yerine ayrı bir kullanıcı oluşturun:

```bash
adduser promptda
usermod -aG sudo promptda
```

Şifre belirleyin ve diğer soruları Enter ile geçin.

### 2.3 Firewall Kurulumu

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

**Kontrol:**
```bash
ufw status
```

---

## 📦 Adım 3: Gerekli Yazılımları Kurma

### 3.1 Sistem Güncellemesi

```bash
apt update && apt upgrade -y
```

### 3.2 Node.js Kurulumu (v20.x LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
```

**Kontrol:**
```bash
node -v    # v20.x.x görmelisiniz
npm -v     # 10.x.x görmelisiniz
```

### 3.3 PM2 Kurulumu (Process Manager)

PM2, Next.js uygulamanızı sürekli çalışır halde tutacak:

```bash
npm install -g pm2
```

### 3.4 Git Kurulumu

```bash
apt install -y git
```

### 3.5 Nginx Kurulumu (Reverse Proxy - Opsiyonel ama önerilen)

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

---

## 🗂️ Adım 4: Proje Dosyalarını VPS'e Aktarma

**İki yöntem var:**

### Yöntem A: GitHub ile (Önerilen)

#### 4.1 GitHub'a Push

**Yerel bilgisayarınızda:**

```bash
cd C:\Users\laptop\Desktop\promptda
git init
git add .
git commit -m "Initial commit for deployment"
git remote add origin https://github.com/KULLANICI_ADINIZ/promptda.git
git push -u origin main
```

> **Not:** GitHub'da yeni bir private repository oluşturmanız gerekecek.

#### 4.2 VPS'de Clone

**VPS'de:**

```bash
cd /var/www
git clone https://github.com/KULLANICI_ADINIZ/promptda.git
cd promptda
```

### Yöntem B: SCP ile Doğrudan Transfer (GitHub kullanmıyorsanız)

**Yerel Windows PowerShell'de:**

```powershell
scp -r C:\Users\laptop\Desktop\promptda root@VPS_IP:/var/www/
```

**Örnek:**
```powershell
scp -r C:\Users\laptop\Desktop\promptda root@185.123.45.67:/var/www/
```

---

## ⚙️ Adım 5: Uygulama Kurulumu

### 5.1 Dizine Girin

```bash
cd /var/www/promptda
```

### 5.2 Bağımlılıkları Yükleyin

```bash
npm install
```

> **Önemli:** Bu 2-5 dakika sürebilir.

### 5.3 Environment Dosyasını Oluşturun

```bash
nano .env
```

**Aşağıdaki içeriği yapıştırın ve düzenleyin:**

```env
# Database
DATABASE_URL="file:./dev.db"

# App URL (Domain veya IP adresiniz)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Session Secret (Rastgele güçlü bir string)
SESSION_SECRET="your-super-secret-key-here-change-this"

# NextAuth Secret (Şifre oluşturmak için: openssl rand -base64 32)
NEXTAUTH_SECRET="another-secret-key-here"

# Node Environment
NODE_ENV="production"
```

**Kaydetmek için:** `CTRL+O` > Enter > `CTRL+X`

**SESSION_SECRET oluşturmak için:**
```bash
openssl rand -base64 32
```

### 5.4 Veritabanını Oluşturun

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 5.5 Production Build

```bash
npm run build
```

> **Önemli:** Bu işlem 3-10 dakika sürebilir. Hata alırsanız loglara bakın.

---

## 🎯 Adım 6: Uygulamayı Başlatma

### 6.1 PM2 ile Başlatma

```bash
pm2 start npm --name "promptda" -- start
```

**Otomatik başlatma (sunucu yeniden başlatınca):**

```bash
pm2 startup
pm2 save
```

### 6.2 Kontrol

```bash
pm2 status
pm2 logs promptda
```

**Tarayıcıdan test:**
```
http://VPS_IP_ADRESINIZ:3000
```

---

## 🌐 Adım 7: Domain Bağlama ve Nginx Ayarları

### 7.1 Domain'i VPS'e Yönlendirin

**DNS Ayarları:** (Domain sağlayıcınızın panelinden)

```
A Record:
@        → VPS_IP_ADRESINIZ
www      → VPS_IP_ADRESINIZ
```

**Propagasyon:** 5 dakika - 48 saat sürebilir.

### 7.2 Nginx Reverse Proxy Konfigürasyonu

```bash
nano /etc/nginx/sites-available/promptda
```

**Aşağıdaki içeriği yapıştırın:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Değiştirin:** `yourdomain.com` → kendi domaininiz

**Kaydet:** `CTRL+O` > Enter > `CTRL+X`

### 7.3 Nginx'i Etkinleştirin

```bash
ln -s /etc/nginx/sites-available/promptda /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

**Tarayıcıdan test:**
```
http://yourdomain.com
```

---

## 🔒 Adım 8: SSL Sertifikası (HTTPS) - Let's Encrypt

### 8.1 Certbot Kurulumu

```bash
apt install -y certbot python3-certbot-nginx
```

### 8.2 SSL Sertifikası Alma

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Sorular:**
- Email: Geçerli bir email girin
- Terms: `A` (Agree)
- Share email: `N` (No)
- Redirect HTTP to HTTPS: `2` (Yes)

**Otomatik yenileme testi:**
```bash
certbot renew --dry-run
```

---

## ✅ Adım 9: Son Kontroller

### 9.1 Uygulama Durumu

```bash
pm2 status
pm2 logs promptda --lines 50
```

### 9.2 Tarayıcıda Test

```
https://yourdomain.com
```

**Kontrol edilecekler:**
- ✅ Ana sayfa açılıyor
- ✅ Login çalışıyor
- ✅ Admin panel erişilebilir (`/en/admin`)
- ✅ HTTPS çalışıyor (yeşil kilit)

---

## 📊 Adım 10: Monitoring ve Yönetim

### PM2 Komutları

```bash
pm2 status                    # Durum kontrol
pm2 logs promptda             # Logları izle
pm2 restart promptda          # Yeniden başlat
pm2 stop promptda             # Durdur
pm2 delete promptda           # Sil
pm2 monit                     # Canlı monitoring
```

### Uygulama Güncellemesi

```bash
cd /var/www/promptda
git pull origin main          # veya GitHub'dan güncel kodu çek
npm install                   # Yeni bağımlılıklar
npx prisma migrate deploy     # Veritabanı güncellemeleri
npm run build                 # Yeni build
pm2 restart promptda          # Yeniden başlat
```

### Log Dosyaları

```bash
pm2 logs promptda
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

## 🐛 Yaygın Sorunlar ve Çözümler

### Problem: Port 3000 Kullanımda

```bash
lsof -i :3000
kill -9 PID_NUMARASI
pm2 restart promptda
```

### Problem: Build Hatası (Memory)

Swap ekleyin:

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

### Problem: Database Locked

```bash
cd /var/www/promptda
rm prisma/dev.db
npx prisma migrate deploy
npx prisma db seed
pm2 restart promptda
```

### Problem: Nginx 502 Bad Gateway

```bash
pm2 status                    # Uygulama çalışıyor mu?
pm2 logs promptda             # Hata var mı?
systemctl status nginx        # Nginx çalışıyor mu?
```

---

## 📁 Önemli Dosya Yolları

```
/var/www/promptda/              # Uygulama ana dizini
/var/www/promptda/prisma/dev.db # SQLite veritabanı
/etc/nginx/sites-available/     # Nginx konfigürasyonları
/var/log/nginx/                 # Nginx logları
~/.pm2/logs/                    # PM2 logları
```

---

## 🔄 Yedekleme Stratejisi

### Veritabanı Yedekleme

```bash
# Manuel yedek
cp /var/www/promptda/prisma/dev.db /var/www/promptda/backups/db_$(date +%Y%m%d_%H%M%S).db

# Otomatik günlük yedek (Cron)
crontab -e
```

Ekleyin:
```cron
0 2 * * * cp /var/www/promptda/prisma/dev.db /var/www/promptda/backups/db_$(date +\%Y\%m\%d).db
```

---

## 🎉 Tamamdır!

Uygulamanız artık canlıda! 

**Erişim:**
- Frontend: `https://yourdomain.com`
- Admin Panel: `https://yourdomain.com/en/admin`

**İlk Admin Kullanıcısı:**
- Email: Seed scriptinde tanımlanan
- Şifre: Seed scriptinde tanımlanan

---

## 📞 Destek

Sorun yaşarsanız:
1. `pm2 logs promptda` komutunu çalıştırın
2. Hata mesajlarını kontrol edin
3. `/var/log/nginx/error.log` dosyasına bakın

**Başarılar! 🚀**
