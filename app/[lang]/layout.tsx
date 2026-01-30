import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

// Load Inter font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

import { constructMetadata, getGlobalSchema } from "@/lib/seo";
import { SystemSettingsProvider } from "@/components/providers/SystemSettingsProvider";
import { getSystemSettings } from "@/lib/settings";
import { getSession } from "@/lib/session";
import MaintenanceView from "@/components/MaintenanceView";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';

  const path = '/'; // Base path for the layout
  return constructMetadata({
    alternates: {
      canonical: lang === 'en' ? `${baseUrl}` : `${baseUrl}/${lang}`,
      languages: {
        'en': `${baseUrl}`,
        'de': `${baseUrl}/de`,
        'es': `${baseUrl}/es`,
        'tr': `${baseUrl}/tr`,
        'x-default': `${baseUrl}`,
      },
    },
  });
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'de' }, { lang: 'es' }, { lang: 'tr' }]
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const [settings, session] = await Promise.all([
    getSystemSettings(),
    getSession()
  ]);

  const gaId = settings.google_analytics_id;
  const isMaintenance = settings.maintenance_mode === "true" && session?.role !== 'admin';

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* Dynamic Meta Tags Extra */}
        {settings.meta_tags_extra && (
          <script
            dangerouslySetInnerHTML={{
              __html: `/* Site Meta Tags Extra Placeholder - Next.js would move this */`,
            }}
          />
        )}
        {settings.meta_tags_extra && (
          <title>{/* Keep this to ensure head exists */}</title>
        )}
        {settings.meta_tags_extra && (
          <div dangerouslySetInnerHTML={{ __html: settings.meta_tags_extra }} style={{ display: 'none' }} />
        )}
        {/* Note: In Next.js App Router, injecting raw HTML into head is tricky without a dedicated component.
            For now, I will use a div with display none at the start of body if head injection is unstable,
            but usually, browsers are lenient. Let's try to put them at the top of head. */}

        {/* Google Analytics */}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || !('theme' in localStorage)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground transition-colors duration-300`}>
        {isMaintenance ? (
          <MaintenanceView lang={lang} />
        ) : (
          <>
            <SystemSettingsProvider settings={settings}>
              {children}
            </SystemSettingsProvider>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(await getGlobalSchema()) }}
            />
          </>
        )}

        {/* Dynamic Footer Script */}
        {settings.custom_footer_script && (
          <div dangerouslySetInnerHTML={{ __html: settings.custom_footer_script }} />
        )}
      </body>
    </html>
  );
}
