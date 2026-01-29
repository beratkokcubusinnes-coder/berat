# Sitemap Yapısı - SEO Optimizasyonu

## 🗺️ Yeni Sitemap Mimarisi

Platformunuz artık **gelişmiş sitemap yapısı** kullanıyor. Her içerik tipi için ayrı sitemap oluşturuldu.

### **Sitemap Listesi**

| Sitemap Dosyası | İçerik | Öncelik | Güncelleme |
|----------------|--------|---------|-----------|
| `sitemap.xml` | Ana statik sayfalar | 1.0 | Günlük |
| `prompts-sitemap.xml` | Tüm prompts | 0.8 | Haftalık |
| `scripts-sitemap.xml` | Tüm scripts | 0.7 | Haftalık |
| `hooks-sitemap.xml` | Tüm hooks | 0.7 | Haftalık |
| `tools-sitemap.xml` | Tüm tools | 0.8 | Haftalık |
| `blog-sitemap.xml` | Tüm blog yazıları | 0.7 | Haftalık |
| `community-sitemap.xml` | Community postları | 0.6 | Günlük |
| `members-sitemap.xml` | Kullanıcı profilleri | 0.5 | Aylık |
| `categories-sitemap.xml` | Tüm kategoriler | **0.9** | Haftalık |

---

## 📂 Sitemap İçerikleri

### **1. Ana Sitemap (`sitemap.xml`)**
Statik sayfalar:
- `/` (Ana sayfa)
- `/en` (İngilizce ana sayfa)
- `/en/prompts` (Prompts listesi)
- `/en/scripts` (Scripts listesi)
- `/en/hooks` (Hooks listesi)
- `/en/tools` (Tools listesi)
- `/en/blog` (Blog listesi)
- `/en/community` (Community)
- `/en/members` (Üyeler sayfası)

---

### **2. Prompts Sitemap (`prompts-sitemap.xml`)**
**Format:** `/en/prompt/{slug}`

Tüm prompt detay sayfaları:
```
/en/prompt/ai-photography-masterpiece
/en/prompt/logo-design-modern
/en/prompt/character-concept-art
```

**Özellikler:**
- Priority: 0.8 (Yüksek öncelik)
- LastModified: Her prompt'un son güncelleme tarihi
- ChangeFrequency: Weekly

---

### **3. Scripts Sitemap (`scripts-sitemap.xml`)**
**Format:** `/en/script/{slug}`

Tüm script detay sayfaları.

---

### **4. Hooks Sitemap (`hooks-sitemap.xml`)**
**Format:** `/en/hook/{slug}`

Tüm hook detay sayfaları.

---

### **5. Tools Sitemap (`tools-sitemap.xml`)**
**Format:** `/en/tool/{slug}`

Tüm tool detay sayfaları.

---

### **6. Blog Sitemap (`blog-sitemap.xml`)**
**Format:** `/en/blog/{slug}`

Sadece yayınlanmış blog yazıları (`published: true`).

---

### **7. Community Sitemap (`community-sitemap.xml`)**
**Format:** `/en/community/{slug}`

Community postları - günlük güncellenir.

---

### **8. Members Sitemap (`members-sitemap.xml`)**
**Format:** `/en/profile/{username}`

Tüm kullanıcı profilleri.

**Özellik:** Aylık güncellenir (en düşük öncelik).

---

### **9. Categories Sitemap (`categories-sitemap.xml`)** ⭐
**EN ÖNEMLİ SITEMAP!**

**Format:** Kategori tipine göre:
- Prompt kategorileri: `/en/prompt/{slug}`
- Script kategorileri: `/en/scripts/{slug}`
- Hook kategorileri: `/en/hooks/{slug}`
- Tool kategorileri: `/en/tools/{slug}`

**Özellikler:**
- **Priority: 0.9** (En yüksek öncelik - ana sayfadan sonra)
- Tüm ana kategori tiplerine otomatik URL mapping
- Haftalık güncelleme

**Örnek Kategoriler:**
```
/en/prompt/photography
/en/prompt/ai-art
/en/scripts/automation
/en/tools/image-generators
```

---

## 🤖 robots.txt Entegrasyonu

`robots.txt` otomatik olarak tüm sitemap'leri listeliyor:

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /settings/

Sitemap: https://promptda.com/sitemap.xml
Sitemap: https://promptda.com/prompts-sitemap.xml
Sitemap: https://promptda.com/scripts-sitemap.xml
Sitemap: https://promptda.com/hooks-sitemap.xml
Sitemap: https://promptda.com/tools-sitemap.xml
Sitemap: https://promptda.com/blog-sitemap.xml
Sitemap: https://promptda.com/community-sitemap.xml
Sitemap: https://promptda.com/members-sitemap.xml
Sitemap: https://promptda.com/categories-sitemap.xml
```

---

## 🎯 SEO Faydaları

### **1. Hızlı İndeksleme**
- Her içerik tipi için ayrı sitemap = daha hızlı keşif
- Google her sitemap'i bağımsız işler

### **2. Organize Yapı**
- İçerik tiplerini kolayca takip
- Hangi sayfaların indexlendiğini görme

### **3. Önceliklendirme**
- Kategoriler (0.9) > Prompts/Tools (0.8) > Blog (0.7)
- Google önce önemli sayfaları indexler

### **4. Performans**
- Küçük sitemap dosyaları = hızlı işleme
- 50,000 URL limiti aşılmaz

---

## 📊 URL Sayısı Tahmini

Örnek bir sitede:
- Ana sitemap: 9 URL
- Prompts: 5,000 URL
- Scripts: 1,000 URL
- Hooks: 500 URL
- Tools: 2,000 URL
- Blog: 200 URL
- Community: 1,000 URL
- Members: 10,000 URL
- **Categories: 150 URL** ⭐

**Toplam: ~20,000 URL**

Ayrı sitemap yapısı sayesinde sorunsuz yönetim!

---

## 🔍 Test Etme

### **1. Sitemap'leri Kontrol Et**
```
https://promptda.com/sitemap.xml
https://promptda.com/prompts-sitemap.xml
https://promptda.com/categories-sitemap.xml
```

### **2. robots.txt Kontrol**
```
https://promptda.com/robots.txt
```

### **3. Google Search Console**
1. Search Console'a git
2. Sitemaps → Add new sitemap
3. Her sitemap'i ekle:
   - `sitemap.xml`
   - `prompts-sitemap.xml`
   - `scripts-sitemap.xml`
   - ... (hepsini)

### **4. XML Sitemap Validator**
- [XML Sitemaps Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- Sitemap URL'ini yapıştır
- Hataları kontrol et

---

## ⚡ Önemli Notlar

### **Otomatik Güncelleme**
- Sitemap'ler dinamik
- Her sayfa eklendiğinde otomatik sitemap'e eklenir
- `updatedAt` tarihleri otomatik güncellenir

### **Kategori Mapping**
Categories sitemap akıllı:
```typescript
prompt → /en/prompt/{slug}
script → /en/scripts/{slug}
hook → /en/hooks/{slug}
tool → /en/tools/{slug}
```

### **Cache**
- Next.js sitemap'leri build time'da oluşturur
- Production build gerekebilir: `npm run build`

---

## 🚀 Google'a Gönderme

### **Manuel Gönderim**
Google Search Console → Sitemaps:
```
prompts-sitemap.xml
scripts-sitemap.xml
hooks-sitemap.xml
tools-sitemap.xml
blog-sitemap.xml
community-sitemap.xml
members-sitemap.xml
categories-sitemap.xml
```

### **Otomatik Keşif**
robots.txt sayesinde Google otomatik keşfeder!

---

## 📈 Takip

Google Search Console'da:
- **Coverage** → Hangi sayfalar indexlendi
- **Sitemaps** → Sitemap durumu
- **URL Inspection** → Bireysel URL testi

---

**Sitemap yapınız artık enterprise seviyede! 🎉**
