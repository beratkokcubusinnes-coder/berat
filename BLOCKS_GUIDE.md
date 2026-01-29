# Dinamik Blok Sistemi - Kullanım Kılavuzu

## 🎯 Blok Tipleri ve JSON Formatları

### 1. **📋 FAQ / Accordion** (Schema.org FAQPage ile)
SEO için otomatik FAQPage schema eklenir.

**JSON Formatı:**
```json
{
  "items": [
    {
      "question": "How do I use AI prompts?",
      "answer": "<p>Simply copy the prompt and paste it into your AI tool like <strong>ChatGPT</strong> or <strong>Midjourney</strong>.</p>"
    },
    {
      "question": "Are these prompts free?",
      "answer": "<p>Yes! All prompts are <em>completely free</em> to use.</p>"
    }
  ]
}
```

---

### 2. **📝 Rich Text**
Basit HTML içerik bloğu.

**JSON Formatı:**
```json
{
  "content": "<p>Discover our <strong>premium collection</strong> of AI prompts...</p><ul><li>High quality</li><li>SEO optimized</li></ul>"
}
```

---

### 3. **🖼️ Image + Text**
Görsel ve metin yan yana.

**JSON Formatı:**
```json
{
  "content": "<p>Learn how to create amazing AI art...</p>",
  "imageUrl": "https://example.com/image.jpg",
  "imageAlt": "AI Art Example",
  "imagePosition": "right"
}
```

---

### 4. **✅ How-To Guide** (Schema.org HowTo ile)
Adım adım kılavuzlar için. SEO için HowTo schema eklenir.

**JSON Formatı:**
```json
{
  "description": "Learn how to create the perfect AI prompt",
  "steps": [
    {
      "name": "Define Your Goal",
      "text": "<p>First, clearly define what you want to achieve with your prompt.</p>",
      "image": "https://example.com/step1.jpg"
    },
    {
      "name": "Choose Keywords",
      "text": "<p>Select powerful keywords that describe your desired output.</p>"
    },
    {
      "name": "Test and Iterate",
      "text": "<p>Run your prompt and refine based on results.</p>"
    }
  ]
}
```

---

### 5. **🎥 Video Embed** (Schema.org VideoObject ile)
YouTube, Vimeo veya direkt video. SEO için VideoObject schema eklenir.

**JSON Formatı:**
```json
{
  "description": "Watch our tutorial on creating AI prompts",
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "uploadDate": "2026-01-29"
}
```

**Desteklenen Platformlar:**
- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
- YouTube Short: `https://youtu.be/VIDEO_ID`
- Vimeo: `https://vimeo.com/VIDEO_ID`

---

### 6. **📊 Stats / Numbers**
İstatistikleri göstermek için.

**JSON Formatı:**
```json
{
  "stats": [
    {
      "label": "Active Users",
      "value": "50K+",
      "icon": "users"
    },
    {
      "label": "Prompts",
      "value": "10K+",
      "icon": "star"
    },
    {
      "label": "Success Rate",
      "value": "98%",
      "icon": "trending"
    },
    {
      "label": "AI Models",
      "value": "15+",
      "icon": "zap"
    }
  ]
}
```

**Icon Options:** `users`, `star`, `trending`, `zap`

---

### 7. **🚀 Call-to-Action**
CTA banner/buton.

**JSON Formatı:**
```json
{
  "title": "Ready to Create Amazing AI Art?",
  "description": "Join thousands of creators using our platform to generate stunning prompts and graphics.",
  "buttonText": "Get Started Free", "buttonUrl": "/register",
  "style": "gradient"
}
```

**Style Options:** `primary`, `gradient`, `outline`

---

### 8. **⭐ Reviews / Ratings** (Schema.org Review + AggregateRating ile)
Ürün/tool incelemeleri ve derecelendirmeler. SEO için Review ve AggregateRating schema eklenir.

**JSON Formatı:**
```json
{
  "itemName": "AI Prompt Generator Pro",
  "itemType": "SoftwareApplication",
  "showAggregate": true,
  "reviews": [
    {
      "author": "John Doe",
      "rating": 5,
      "body": "This tool is amazing! Helped me create professional prompts in minutes.",
      "date": "2026-01-15",
      "avatar": "https://example.com/john.jpg"
    },
    {
      "author": "Jane Smith",
      "rating": 4,
      "body": "Very useful and intuitive. Great for beginners and pros alike.",
      "date": "2026-01-20"
    },
    {
      "author": "Mike Johnson",
      "rating": 5,
      "body": "Best AI prompt tool I've used. Highly recommend!",
      "date": "2026-01-25"
    }
  ]
}
```

**itemType Options:** 
- `Product` - Fiziksel/dijital ürünler
- `SoftwareApplication` - Yazılım/araçlar
- `Service` - Hizmetler
- `CreativeWork` - Kreatif çalışmalar

**SEO Faydası:** Google'da ⭐⭐⭐⭐⭐ yıldızlı sonuçlar!

---

## 🔍 SEO Özellikleri

### Schema.org Entegrasyonu
Aşağıdaki blok tipleri otomatik olarak SEO schema ekler:

1. **FAQ Block** → `FAQPage` schema
2. **How-To Block** → `HowTo` schema
3. **Video Block** → `VideoObject` schema
4. **Image+Text Block** → `ImageObject` schema
5. **Review Block** → `Review` + `AggregateRating` schema

### Semantik HTML
Tüm bloklar semantic HTML5 kullanır:
- `<section>` - Ana blok container
- `<article>` - İçerik blokları için
- `<h1>`, `<h2>`, `<h3>` - Proper heading hierarchy
- `<ol>`, `<ul>` - Liste yapıları

---

## 📍 Identifier Kuralları

| Identifier | Görüneceği Sayfa |
|-----------|------------------|
| `prompts` | `/en/prompts` (Ana liste) |
| `scripts` | `/en/scripts` (Ana liste) |
| `hooks` | `/en/hooks` (Ana liste) |
| `tools` | `/en/tools` (Ana liste) |
| `blog` | `/en/blog` (Ana liste) |
| `community` | `/en/community` (Ana liste) |
| `category:all` | Tüm kategori detay sayfaları |
| `category:photography` | `/en/prompt/photography` (Belirli kategori) |
| `category:ai-art` | `/en/prompt/ai-art` (Belirli kategori) |

---

## 🎨 Kullanım Örnekleri

### Örnek 1: Ana Sayfada FAQ
```
Admin Label: Homepage FAQ
Type: FAQ / Accordion
Identifier: prompts
Placement: bottom
Title: Frequently Asked Questions
```

### Örnek 2: Kategori İçin How-To
```
Admin Label: Photography How-To
Type: How-To Guide
Identifier: category:photography
Placement: top
Title: How to Create Perfect Photography Prompts
```

### Örnek 3: Video Tutorial
```
Admin Label: Getting Started Video
Type: Video Embed
Identifier: prompts
Placement: top
Title: Watch: Creating Your First AI Prompt
```

---

## ⚡ Hızlı İpuçları

1. **Title alanı SEO için önemli** - Schema'larda kullanılır
2. **HTML içeriğe dikkat** - XSS saldırılarına karşı güvenli içerik kullan
3. **Order değeri** - Küçük sayılar üstte görünür (0, 1, 2...)
4. **Active checkbox** - Test için devre dışı bırakabilirsin
5. **Identifier** - Yanlış yazmamaya dikkat, logları kontrol et

---

## 🐛 Sorun Giderme

**Blok görünmüyor mu?**
1. Terminal loglarını kontrol et: `[Blocks] Category: ..., Found: ...`
2. Identifier doğru mu? `prompts` vs `category:slug`
3. `isActive` işaretli mi?
4. `placement` doğru mu? (`top` / `bottom`)
5. JSON geçerli mi? Test et: `JSON.parse(content)`

---

**Tebrikler! 🎉** Artık tam teşekküllü bir dinamik blok sisteminiz var!
