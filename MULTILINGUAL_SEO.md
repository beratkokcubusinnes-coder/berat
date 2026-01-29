# Çok Dilli SEO Optimizasyonu

## 🌍 Desteklenen Diller

| Dil | Kod | Locale | Flag |
|-----|-----|--------|------|
| English | `en` | `en-US` | 🇺🇸 |
| Türkçe | `tr` | `tr-TR` | 🇹🇷 |
| Deutsch | `de` | `de-DE` | 🇩🇪 |
| Español | `es` | `es-ES` | 🇪🇸 |

**Varsayılan Dil:** `en` (English)

---

## 🎯 SEO Optimizasyonları

### **1. Hreflang Tags** ✅

Her sayfada otomatik olarak tüm dil alternatifleri eklenir:

```html
<link rel="alternate" hreflang="en" href="https://promptda.com/en/prompts" />
<link rel="alternate" hreflang="tr" href="https://promptda.com/tr/prompts" />
<link rel="alternate" hreflang="de" href="https://promptda.com/de/prompts" />
<link rel="alternate" hreflang="es" href="https://promptda.com/es/prompts" />
<link rel="alternate" hreflang="x-default" href="https://promptda.com/en/prompts" />
```

**x-default:** İngilizce varsayılan dil olarak ayarlandı.

---

### **2. Sitemap Alternates** ✅

Tüm sitemap'lerde dil alternatifleri var:

```xml
<url>
  <loc>https://promptda.com/en/prompt/ai-art</loc>
  <lastmod>2026-01-29</lastmod>
  <xhtml:link rel="alternate" hreflang="en" href="https://promptda.com/en/prompt/ai-art"/>
  <xhtml:link rel="alternate" hreflang="tr" href="https://promptda.com/tr/prompt/ai-art"/>
  <xhtml:link rel="alternate" hreflang="de" href="https://promptda.com/de/prompt/ai-art"/>
  <xhtml:link rel="alternate" hreflang="es" href="https://promptda.com/es/prompt/ai-art"/>
</url>
```

**Faydası:** Google her dil versiyonunu bilir ve doğru dilde gösterir.

---

### **3. Canonical URLs** ✅

Her sayfa kendi diline canonical olarak işaret eder:

```html
<!-- İngilizce sayfada -->
<link rel="canonical" href="https://promptda.com/en/prompts" />

<!-- Türkçe sayfada -->
<link rel="canonical" href="https://promptda.com/tr/prompts" />
```

**Faydası:** Duplicate content cezası yok!

---

### **4. Language Metadata** ✅

Her sayfada doğru dil bilgisi:

```html
<html lang="en">
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="tr_TR" />
<meta property="og:locale:alternate" content="de_DE" />
<meta property="og:locale:alternate" content="es_ES" />
```

---

## 📂 URL Yapısı

### **Şu Anki Yapı (Doğru!)**
```
✅ https://promptda.com/en/prompts
✅ https://promptda.com/tr/prompts
✅ https://promptda.com/de/prompts
✅ https://promptda.com/es/prompts
```

### **Yanlış Alternatifler (Kullanmayın!)**
```
❌ https://en.promptda.com/prompts (Subdomain)
❌ https://promptda.com/prompts?lang=en (Query parameter)
```

**Neden subdirectory en iyi?**
1. ✅ Tek domain authority
2. ✅ Kolay yönetim
3. ✅ Hreflang ile perfect uyum
4. ✅ Google'ın önerdiği yöntem

---

## 🗺️ Sitemap Yapısı

### **Ana Sitemap** (`sitemap.xml`)
Her dil için statik sayfalar + alternates:

```xml
<url>
  <loc>https://promptda.com/en/prompts</loc>
  <xhtml:link rel="alternate" hreflang="tr" href=".../tr/prompts"/>
  <xhtml:link rel="alternate" hreflang="de" href=".../de/prompts"/>
  <xhtml:link rel="alternate" hreflang="es" href=".../es/prompts"/>
  <priority>0.9</priority>
</url>
```

### **İçerik Sitemap'leri** (prompts, categories, vb.)
Her içerik her dilde + alternates:

```xml
<!-- Photography categorisi - 4 dilde -->
<url>
  <loc>https://promptda.com/en/prompt/photography</loc>
  <xhtml:link rel="alternate" hreflang="en" href=".../en/prompt/photography"/>
  <xhtml:link rel="alternate" hreflang="tr" href=".../tr/prompt/photography"/>
  <xhtml:link rel="alternate" hreflang="de" href=".../de/prompt/photography"/>
  <xhtml:link rel="alternate" hreflang="es" href=".../es/prompt/photography"/>
</url>
```

**Toplam URL Hesabı:**
- 100 kategori × 4 dil = **400 URL**
- 5,000 prompt × 4 dil = **20,000 URL**

---

## 🎨 Dil Değiştirici (LanguageSwitcher)

Kullanıcıların diller arası geçiş yapması için komponent:

```tsx
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

// Navbar'a ekle
<LanguageSwitcher currentLang={lang} />
```

**Özellikler:**
- 🌐 Globe icon
- 🚩 Bayrak emojileri
- ✅ Aktif dil vurgusu
- 🔗 Aynı sayfa farklı dile geçiş
- 📱 Responsive dropdown

---

## 🔧 Kurulum ve Kullanım

### **1. Dil Yapılandırması**

Dosya: `lib/i18n.ts`

```typescript
export const languages = [
  { code: 'en', name: 'English', locale: 'en-US', flag: '🇺🇸' },
  { code: 'tr', name: 'Türkçe', locale: 'tr-TR', flag: '🇹🇷' },
  { code: 'de', name: 'Deutsch', locale: 'de-DE', flag: '🇩🇪' },
  { code: 'es', name: 'Español', locale: 'es-ES', flag: '🇪🇸' },
];

export const defaultLanguage = 'en';
```

**Yeni Dil Eklemek:**
1. `languages` array'ine ekle
2. `LANGUAGES` constant'ını sitemap'lerde güncelle
3. `generateStaticParams`'a ekle
4. Dictionary dosyası oluştur

---

### **2. Hreflang Helper Kullanımı**

```typescript
import { generateAlternates } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const baseUrl = 'https://promptda.com';
  
  return {
    ...generateAlternates(`/${lang}/prompts`, baseUrl),
  };
}
```

---

### **3. Sitemap'lerde Dil Desteği**

Her sitemap otomatik olarak tüm dilleri içerir:

```typescript
LANGUAGES.forEach(lang => {
  routes.push({
    url: `${baseUrl}/${lang}/prompt/${slug}`,
    alternates: {
      languages: Object.fromEntries(
        LANGUAGES.map(l => [l, `${baseUrl}/${l}/prompt/${slug}`])
      ),
    },
  });
});
```

---

## 📊 Google Search Console Kurulumu

### **1. Her Dil İçin Ayrı Rapor**

Search Console → Settings → International Targeting:
- 🇺🇸 `/en/` → English (United States)
- 🇹🇷 `/tr/` → Turkish (Turkey)
- 🇩🇪 `/de/` → German (Germany)
- 🇪🇸 `/es/` → Spanish (Spain)

### **2. Hreflang Hatalarını Kontrol**

Search Console → Enhancements → International Targeting:
- ✅ "No hreflang errors" olmalı
- Hata varsa düzelt!

### **3. Her Dil için Performance**

Search Console → Performance → Filters:
- Page → contains → `/en/`
- Page → contains → `/tr/`

Her dilin performansını ayrı takip et!

---

## 🌟 SEO Best Practices

### **1. URL Consistency** ✅
```
✅ DOĞRU: /en/prompt/ai-art
❌ YANLIŞ: /en/prompts/ai-art vs /tr/prompt/ai-art
```
Tüm dillerde aynı URL yapısı kullan!

### **2. Slug Strateji**

**Seçenek A: İngilizce slug (şu anki)** ✅
```
/en/prompt/photography
/tr/prompt/photography  ← Aynı slug
/de/prompt/photography  ← Aynı slug
```

**Avantajları:**
- Kolay yönetim
- Tek slug field
- URL consistency

**Seçenek B: Çevrilmiş slug**
```
/en/prompt/photography
/tr/prompt/fotograf
/de/prompt/fotografie
```

**Avantajları:**
- Daha iyi kullanıcı deneyimi
- Yerel SEO boost

**Öneri:** Şu anki yapı (A) ile devam et. Basit ve etkili!

### **3. Content Strategy**

Her dil için:
- ✅ Çevrilmiş başlıklar
- ✅ Çevrilmiş açıklamalar
- ✅ Yerel keywords
- ❌ Auto-translate kullanma (kalite düşer)

---

## 🎯 Gelecek Optimizasyonlar

### **1. Geo-Targeting**
```typescript
// robots.txt'de bölgesel ayarlama
User-agent: Googlebot
Crawl-delay: 0
Allow: /en/
Disallow: /

User-agent: Yandex  (Rusya için)
Allow: /ru/
```

### **2. Dil Otomatik Algılama**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language');
  // Kullanıcının tarayıcı diline göre yönlendir
}
```

### **3. Yerel Backlink Stratejisi**
- 🇹🇷 Türk sitelere `/tr/` linkler
- 🇩🇪 Alman sitelere `/de/` linkler
- Domain authority her dil için ayrı boost

---

## 🐛 Yaygın Hatalar ve Çözümleri

### **Hata 1: Duplicate Content**
```
❌ /prompts ve /en/prompts aynı içerik
```

**Çözüm:** Root'tan dile redirect:
```typescript
// middleware.ts
if (!pathname.startsWith('/en')) {
  return NextResponse.redirect(`/en${pathname}`);
}
```

### **Hata 2: Eksik x-default**
```
❌ x-default yok
```

**Çözüm:** Her zaman varsayılan dile işaret et:
```typescript
'x-default': `${baseUrl}/en${path}`
```

### **Hata 3: Karışık Hreflang**
```
❌ /en/prompt/ai-art → /tr/prompts/ai-art
```

**Çözüm:** URL yapısını tüm dillerde aynı tut!

---

## ✅ Checklist

Yeni sayfa eklerken:
- [ ] Hreflang tags eklendi mi?
- [ ] Canonical URL doğru mu?
- [ ] Sitemap'e tüm diller eklendi mi?
- [ ] x-default tanımlandı mı?
- [ ] URL yapısı tüm dillerde aynı mı?

---

**Platforms artık Google'ın çok dilli SEO standartlarına %100 uyumlu! 🌍**
