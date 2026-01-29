# Çok Dilli İçerik Yönetimi (YouTube Tarzı)

## 🎬 YouTube Gibi Çoklu Dil Desteği

Her içerik (prompt, script, hook, tool, blog) için **her dilde ayrı** içerik ekleyebilirsiniz!

### **Nasıl Çalışır?**

1. **Admin Panel**de içerik oluştururken dil sekmeleri görürsünüz 🇺🇸 🇹🇷 🇩🇪 🇪🇸
2. Her dilde **ayrı başlık, açıklama, meta veriler** girebilirsiniz
3. Kullanıcı Türkçe seçerse → Türkçe içeriği gösterilir
4. Çeviri yoksa → İngilizce (varsayılan) gösterilir

---

## 📊 Veri Yapısı

### **ContentTranslation Model**

```prisma
model ContentTranslation {
  id              String   @id
  
  // Referans
  contentType     String   // "prompt", "script", "hook", "tool", "blog"
  contentId       String   // İçerik ID'si
  language        String   // "en", "tr", "de", "es"
  
  // Çevrilebilir Alanlar
  title           String
  description     String?
  content         String?
  
  // SEO Alanları
  metaTitle       String?
  metaDescription String?
  ogTitle         String?
  ogDescription   String?
  seoContent      String?
}
```

**Unique Constraint:** Her içeriğin her dilde sadece 1 çevirisi olabilir.

---

## 🎨 Admin Panel Kullanımı

### **MultiLanguageEditor Komponenti**

YouTube gibi dil sekmeleri:

```tsx
import { MultiLanguageEditor } from '@/components/admin/MultiLanguageEditor';

const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({
  en: { title: '', description: '' },
  tr: {},
  de: {},
  es: {},
});

<MultiLanguageEditor
  fields={[
    { label: 'Title', name: 'title', type: 'text', required: true },
    { label: 'Description', name: 'description', type: 'textarea', rows: 4 },
    { label: 'Content', name: 'content', type: 'richtext', rows: 10 },
    { label: 'Meta Title', name: 'metaTitle', type: 'text' },
    { label: 'Meta Description', name: 'metaDescription', type: 'textarea', rows: 2 },
    { label: 'SEO Content', name: 'seoContent', type: 'textarea', rows: 6 },
  ]}
  defaultLanguage="en"
  values={translations}
  onChange={(lang, field, value) => {
    setTranslations(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }));
  }}
/>
```

### **Özellikler**

✅ **Dil Sekmeleri** - 🇺🇸 English, 🇹🇷 Türkçe, 🇩🇪 Deutsch, 🇪🇸 Español  
✅ **İçerik Göstergesi** - Hangi dilde içerik var (yeşil nokta)  
✅ **Varsayılan Dil Uyarısı** - İngilizce zorunlu, diğerleri opsiyonel  
✅ **Karakter Sayacı** - Meta başlık/açıklama için  
✅ **Uyarılar** - Eksik çeviri uyarısı  

---

## 🔧 Helper Fonksiyonlar

### **1. Çeviri Kaydetme**

```typescript
import { saveContentTranslation } from '@/lib/translations';

await saveContentTranslation(
  'prompt',             // contentType
  'clx123456',          // contentId
  'tr',                 // language
  {
    title: 'Fotoğrafçılık İstemi',
    description: 'Profesyonel fotoğraf için AI istemi',
    content: 'Detaylı içerik...',
    metaTitle: 'Fotoğrafçılık AI İstemi | Promptda',
    metaDescription: 'En iyi fotoğrafçılık AI istemi...',
    seoContent: 'Fotoğrafçılık hakkında ek bilgi...',
  }
);
```

### **2. Çeviri Getirme**

```typescript
import { getContentTranslation } from '@/lib/translations';

const translation = await getContentTranslation('prompt', 'clx123456', 'tr');

if (translation) {
  console.log(translation.title); // "Fotoğrafçılık İstemi"
}
```

### **3. Tüm Çevirileri Getirme**

```typescript
import { getAllContentTranslations } from '@/lib/translations';

const allTranslations = await getAllContentTranslations('prompt', 'clx123456');

// {
//   en: { title: 'Photography Prompt', ... },
//   tr: { title: 'Fotoğrafçılık İstemi', ... },
//   de: { title: 'Fotografie Eingabeaufforderung', ... }
// }
```

### **4. Otomatik Fallback ile İçerik**

```typescript
import { getContentWithTranslation } from '@/lib/translations';

const script = await prisma.script.findUnique({ 
  where: { slug: 'my-script' } 
});

// Türkçe çevirisi varsa getir, yoksa orijinal
const localizedScript = await getContentWithTranslation(
  script,
  'script',
  script.id,
  'tr'
);

console.log(localizedScript.title); // Türkçe veya İngilizce
console.log(localizedScript.isTranslated); // true/false
```

---

## 📂 Uygulama Örneği

### **Prompt Ekleme Formu**

```tsx
"use client";

import { useState } from 'react';
import { MultiLanguageEditor } from '@/components/admin/MultiLanguageEditor';

export default function NewPromptPage() {
  const [translations, setTranslations] = useState({
    en: {},
    tr: {},
    de: {},
    es: {},
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // 1. İçeriği oluştur
    const promptRes = await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'my-prompt',
        // Base fields (from English)
        title: translations.en.title,
        description: translations.en.description,
        // ...
      }),
    });

    const prompt = await promptRes.json();

    // 2. Çevirileri kaydet
    await fetch('/api/translations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType: 'prompt',
        contentId: prompt.id,
        translations: translations,
      }),
    });

    alert('Prompt saved with translations!');
  }

  return (
    <form onSubmit={handleSubmit}>
      <MultiLanguageEditor
        fields={[
          { label: 'Title', name: 'title', type: 'text', required: true },
          { label: 'Description', name: 'description', type: 'textarea' },
          { label: 'Prompt Content', name: 'content', type: 'richtext' },
          { label: 'Meta Title', name: 'metaTitle', type: 'text' },
          { label: 'Meta Description', name: 'metaDescription', type: 'textarea' },
        ]}
        values={translations}
        onChange={(lang, field, value) => {
          setTranslations(prev => ({
            ...prev,
            [lang]: { ...prev[lang], [field]: value },
          }));
        }}
      />
      
      <button type="submit">Save Prompt</button>
    </form>
  );
}
```

---

## 🌍 Frontend'de Gösterme

### **Kategori Sayfası**

```tsx
export default async function CategoryPage({ params }) {
  const { lang, category } = await params;
  
  const prompts = await prisma.prompt.findMany({
    where: { category: category },
  });

  // Her prompt için çeviriyi ekle
  const localizedPrompts = await Promise.all(
    prompts.map(async (prompt) => {
      return await getContentWithTranslation(
        prompt,
        'prompt',
        prompt.id,
        lang
      );
    })
  );

  return (
    <div>
      {localizedPrompts.map(prompt => (
        <div key={prompt.id}>
          <h2>{prompt.title}</h2>  {/* Kullanıcının dilinde */}
          <p>{prompt.description}</p>
          {prompt.isTranslated && (
            <span>🌍 Translated to {lang}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

### **SEO Metadata**

```tsx
export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  
  const prompt = await prisma.prompt.findUnique({
    where: { slug },
  });

  const localized = await getContentWithTranslation(
    prompt,
    'prompt',
    prompt.id,
    lang
  );

  return {
    title: localized.metaTitle || localized.title,
    description: localized.metaDescription || localized.description,
    openGraph: {
      title: localized.ogTitle || localized.metaTitle || localized.title,
      description: localized.ogDescription || localized.metaDescription,
    },
  };
}
```

---

## 🎯 SEO Optimizasyonları

### **1. Hreflang Otomatik**

Sitemap'lerdeki hreflang tag'leri otomatik çalışır:

```xml
<url>
  <loc>https://promptda.com/en/prompt/photography</loc>
  <xhtml:link rel="alternate" hreflang="tr" href=".../tr/prompt/photography"/>
</url>
```

**Çeviri varsa:** Türkçe sayfada Türkçe içerik  
**Çeviri yoksa:** Türkçe sayfada İngilizce içerik (fallback)

### **2. Canonical URL**

Her dil kendi canonical'ına işaret eder:

```html
<!-- Türkçe sayfada -->
<link rel="canonical" href="https://promptda.com/tr/prompt/photography" />
```

### **3. Structured Data**

Schema.org yapıları her dilde:

```json
{
  "@type": "Article",
  "headline": "Fotoğrafçılık İstemi",  // Türkçe
  "description": "...",
  "inLanguage": "tr"
}
```

---

## 📊 Database Migration

### **1. Dev Server'ı Durdur**
```bash
Ctrl+C (npm run dev'i durdur)
```

### **2. Database'i Güncelle**
```bash
npx prisma db push
```

### **3. Prisma Client Oluştur**
```bash
npx prisma generate
```

### **4. Dev Server'ı Başlat**
```bash
npm run dev
```

---

## 🔍 Test Etme

### **1. Çeviri Ekleme**
```typescript
await saveContentTranslation('prompt', 'clx123', 'tr', {
  title: 'Test Başlık',
  description: 'Test açıklama',
});
```

### **2. Çeviri Kontrol**
```typescript
const tr = await getContentTranslation('prompt', 'clx123', 'tr');
console.log(tr.title); // "Test Başlık"
```

### **3. Fallback Test**
```typescript
const de = await getContentTranslation('prompt', 'clx123', 'de');
console.log(de); // null (çünkü Almanca çeviri yok)

const content = await getContentWithTranslation(original, 'prompt', 'clx123', 'de');
console.log(content.title); // İngilizce (fallback)
```

---

## 💡 Best Practices

### **1. İngilizce Zorunlu**
✅ Her içerik için İngilizce (varsayılan) mutlaka doldurulmalı  
❌ Diğer diller opsiyonel

### **2. SEO Metaları Doldur**
```
✅ metaTitle: 50-60 karakter
✅ metaDescription: 150-160 karakter
✅ Anahtar kelimeler her dilde farklı
```

### **3. Tutarlı Slug**
```
✅ /en/prompt/photography
✅ /tr/prompt/photography  (aynı slug)
❌ /tr/prompt/fotograf     (farklı slug - kullanma!)
```

### **4. Kademeli Çeviri**
- İlk önce İngilizce içerik oluştur
- Popüler içerikleri Türkçe'ye çevir
- Daha sonra Almanca, İspanyolca ekle

---

## 🚀 Gelecek Özellikler

### **1. Bulk Translation**
```typescript
// Tüm içerikleri toplu çevir
await bulkTranslate('prompts', 'en', 'tr');
```

### **2. Google Translate Entegrasyonu**
```typescript
// Otomatik çeviri (sonradan düzenlenebilir)
await autoTranslate('prompt', 'clx123', 'en', 'tr');
```

### **3. Translation Status**
```typescript
// Hangi içeriklerin çevirisi eksik?
const missing = await getMissingTranslations('prompt', 'tr');
```

---

## ✅ Checklist

İçerik eklerken:
- [ ] İngilizce başlık/açıklama eklendi mi?
- [ ] Meta title/description dolduruldu mu?
- [ ] Diğer diller için çeviri eklendi mi?
- [ ] SEO content her dilde farklı mı?
- [ ] Karakter limitleri kontrol edildi mi?

---

**Artık platformunuz YouTube gibi çoklu dil desteğine sahip! 🎬🌍**
