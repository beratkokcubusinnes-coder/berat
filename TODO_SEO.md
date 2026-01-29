# Promptda SEO Enhancement Plan

This document tracks the progress of semantic SEO improvements across the platform.

## 1. Homepage SEO (`/app/[lang]/page.tsx`)
- [x] **Organization Schema:** Add schema defining the brand, logo, social profiles, and contact info.
- [x] **WebSite Schema:** Add schema defining the site search potential and global site identity.
- [x] **FAQ Schema:** Convert the existing FAQ section into a `FAQPage` schema so it appears as rich snippets in Google.
- [x] **Semantic HTML:** Update the FAQ section to use `<details>` and `<summary>` tags for better accessibility and semantics.

## 2. Scripts Improvements (`/app/[lang]/scripts/...`)
- [x] **SoftwareSourceCode Schema:** Implement schema to define scripts as executable code.
- [x] **Breadcrumb Schema:** Add JSON-LD for the breadcrumb navigation path.
- [x] **Semantic HTML:** Ensure code blocks and descriptions use proper `<pre>`, `<code>`, and `<article>` tags.

## 3. Hooks Improvements (`/app/[lang]/hooks/...`)
- [x] **CreativeWork/Text Schema:** Define viral hooks as CreativeWork or short text content (Already partially handled, prioritized Breadcrumb).
- [x] **Breadcrumb Schema:** Add JSON-LD for the breadcrumb navigation path.
- [x] **Semantic HTML:** Optimize the copy/paste section structure.

## 4. Prompts Improvements (`/app/[lang]/prompt/...`)
- [x] **Breadcrumb Schema:** Add missing BreadcrumbList schema to the existing PromptSEO component or page.
- [x] **Review Existing Schema:** Ensure `HowTo` and `SoftwareSourceCode` schemas are perfectly aligned with Google's latest documentation.

## 5. Category & Listing Pages
- [x] **CollectionPage Schema:** Add schema to all main listing pages (`/prompts`, `/tools`, `/scripts`, `/blog`) to indicate they are collections of items.
- [x] **Breadcrumb:** Add "Home > Category" breadcrumb schema to these list pages.
