# 🎬 Çok Dilli İçerik Ekleme Rehberi

## 📍 Nerede Bulunur?

### **Admin Panel → General → 🌍 Translations**

```
Admin Sidebar → General Section → 🌍 Translations
```

veya direkt URL:
```
http://localhost:3000/en/admin/translations/test
```

---

## 🎨 Nasıl Kullanılır?

### **1. Sayfayı Aç**

Admin panel sol menüden:
- **General** bölümü altında
- **🌍 Translations** linki
- Tıkla!

### **2. Dil Sekmeleri**

Üstte dil sekmeleri göreceksin:

```
🇺🇸 English   🇹🇷 Türkçe   🇩🇪 Deutsch   🇪🇸 Español
```

- Tıklayarak diller arası geçiş yap
- Aktif dil **mavi** renkli
- İçerik olan dillerde **yeşil nokta (●)** var

### **3. İçerik Girme**

#### **🇺🇸 English (Zorunlu)**

İlk önce İngilizce doldur:

```
Title: "Professional Photography AI Prompt"
Description: "Create stunning photos with AI"
Content: "Detailed prompt content..."
Meta Title: "Photography AI Prompt | Promptda"
Meta Description: "Best AI prompt for photography..."
SEO Content: "Additional SEO text for Google..."
```

#### **🇹🇷 Türkçe (Opsiyonel)**

Türkçe sekmesine tıkla:

```
Title: "Profesyonel Fotoğrafçılık AI İstemi"
Description: "AI ile muhteşem fotoğraflar oluşturun"
Content: "Detaylı istem içeriği..."
Meta Title: "Fotoğrafçılık AI İstemi | Promptda"
Meta Description: "Fotoğrafçılık için en iyi AI istemi..."
SEO Content: "Google için ek SEO metni..."
```

#### **🇩🇪 Deutsch (Opsiyonel)**

Almanca sekmesine tıkla, aynı şekilde doldur.

#### **🇪🇸 Español (Opsiyonel)**

İspanyolca sekmesine tıkla, aynı şekilde doldur.

### **4. Karakter Sayacı**

Meta alanlarında otomatik sayaç:

```
Meta Title: 50-60 karakter önerilir
Current: 45 characters ✅

Meta Description: 150-160 karakter önerilir
Current: 155 characters ✅
```

### **5. Uyarılar**

Eksik çeviriler için sarı uyarı:

```
⚠️ No translation yet
Users selecting Türkçe will see the English version 
until you add a translation.
```

### **6. Kaydetme**

En altta:

```
[Save Content & Translations]  [Clear All]
```

"Save" tıkla → İçerik + tüm çeviriler kaydedilir! 🎉

---

## 🔍 Debug Modu

Sayfanın altında "🔍 Debug: Translation Data" açılır menüsü var.

Tıkla → Tüm çeviri datasını JSON formatında görebilirsin:

```json
{
  "en": {
    "title": "Professional Photography AI Prompt",
    "description": "Create stunning photos...",
    ...
  },
  "tr": {
    "title": "Profesyonel Fotoğrafçılık AI İstemi",
    "description": "AI ile muhteşem fotoğraflar...",
    ...
  },
  "de": {},
  "es": {}
}
```

---

## 🎯 Kullanım Senaryoları

### **Senaryo 1: Sadece İngilizce**

1. 🇺🇸 English sekmesinde tüm alanları doldur
2. Diğer dillere dokunma
3. Kaydet
4. ✅ Tüm kullanıcılar İngilizce görecek

### **Senaryo 2: İngilizce + Türkçe**

1. 🇺🇸 English doldur
2. 🇹🇷 Türkçe sekmesine geç
3. Türkçe çeviriyi yaz
4. Kaydet
5. ✅ Türk kullanıcılar Türkçe, diğerleri İngilizce görecek

### **Senaryo 3: Tüm Diller**

1. 🇺🇸 English doldur
2. 🇹🇷 Türkçe doldur
3. 🇩🇪 Deutsch doldur
4. 🇪🇸 Español doldur
5. Kaydet
6. ✅ Herkes kendi dilinde görecek! 🌍

---

## 📊 Karakter Limitleri

| Alan | Önerilen Limit | Neden? |
|------|---------------|--------|
| **Title** | 60-70 karakter | Google başlıkları keser |
| **Meta Title** | 50-60 karakter | Google arama sonucu |
| **Meta Description** | 150-160 karakter | Google snippet |
| **Description** | 200-300 karakter | Okuma kolaylığı |
| **Content** | Sınırsız | Ana içerik |
| **SEO Content** | 500-1000 karakter | Ek SEO boost |

---

## 🎨 Visual Guide

```
┌─────────────────────────────────────────────────────┐
│  Multi-Language Content Test                       │
│  YouTube-style translation interface demo          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🎬 How It Works                                     │
│ • Click on language tabs to switch                  │
│ • English is required, others optional              │
│ • Users see content in their language               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Tabs:                                               │
│ [🇺🇸 English] [🇹🇷 Türkçe●] [🇩🇪 Deutsch] [🇪🇸 Español]│
└─────────────────────────────────────────────────────┘
     ↑ Active      ↑ Has content (●)

┌─────────────────────────────────────────────────────┐
│ 🇺🇸 English                                         │
│ Default language - users will see this if their     │
│ language is not available                           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Title *                                             │
│ [Enter the title                                  ] │
│                                                     │
│ Description                                         │
│ [Short description of the content                ] │
│ [                                                 ] │
│                                                     │
│ Meta Title (SEO)                                    │
│ [SEO title (50-60 characters)                     ] │
│ 📊 Recommended: 50-60 characters                    │
│ Current: 45 characters                              │
└─────────────────────────────────────────────────────┘

[Save Content & Translations]  [Clear All]
```

---

## 💡 Pro Tips

### **1. İngilizce Öncelik**
Her zaman önce İngilizce doldur. Bu varsayılan dil!

### **2. SEO Metaları Dil Bazlı**
Her dilde farklı anahtar kelimeler kullan:

```
🇺🇸 "AI prompt generator professional"
🇹🇷 "yapay zeka istem oluşturucu profesyonel"
🇩🇪 "KI-eingabeaufforderung generator professionell"
```

### **3. Kademeli Çeviri**
1. Tüm içerikleri İngilizce yap
2. Popüler içerikleri Türkçe'ye çevir
3. Analytics'e göre diğer dilleri ekle

### **4. Otomatik Çeviri Sonra Düzelt**
Google Translate kullan ama sonra manuel düzelt!

### **5. Test Et**
Her dilde URL'i kontrol et:
```
/en/prompt/photography → English
/tr/prompt/photography → Türkçe
/de/prompt/photography → Deutsch
```

---

## 🐛 Sorun Giderme

### **"Save butonu çalışmıyor"**
- İngilizce Title dolduruldu mu? (zorunlu)
- Console'da hata var mı?

### **"Çeviri görünmüyor"**
- Database migration yapıldı mı? (`npx prisma generate`)
- Dev server yeniden başlatıldı mı?

### **"Karakter sayacı yok"**
- Meta Title/Description alanlarında otomatik görünür

---

## 🚀 Gelecek Entegrasyonlar

Bu test sayfası örnek. Gerçek kullanım için entegre edilecek:

- ✅ **Admin → Prompts** → Prompt eklerken çoklu dil
- ✅ **Admin → Scripts** → Script eklerken çoklu dil
- ✅ **Admin → Hooks** → Hook eklerken çoklu dil
- ✅ **Admin → Tools** → Tool eklerken çoklu dil
- ✅ **Admin → Blog** → Blog yazarken çoklu dil

---

**Artık çoklu dil sistemini test edebilirsin! 🎬**

URL: `http://localhost:3000/en/admin/translations/test`
